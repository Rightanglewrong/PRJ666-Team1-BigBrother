import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getRelationshipByChildID, 
        getRelationshipByParentID,  
        updateRelationshipInDynamoDB,
        deleteRelationshipFromDynamoDB,
    } from "../../../utils/relationshipAPI";
import { retrieveUserByIDInDynamoDB, getUsersByAccountTypeAndLocation } from "../../../utils/userAPI";
import { retrieveChildProfileByID, retrieveChildrenByLocationID } from "../../../utils/childAPI";
import { useUser } from "@/components/authenticate";
import {
    Container,
    Typography,
    Box,
    Alert,
    Button,
    Card,
    CardContent, 
    CardActions,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    DialogContentText
  } from "@mui/material"; 

export default function Relationships() {
    const router = useRouter();
    const user = useUser();
    const { id, type } = router.query; // `id` is the parentID or childID; `type` specifies "parent" or "child".
    const [relationships, setRelationships] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [entityName, setEntityName] = useState("");
    const [deleteRelation, setDeleteRelation] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingRelation, setEditingRelation] = useState(null);
    const [parentProfiles, setParentProfiles] = useState([]);
    const [childProfiles, setChildProfiles] = useState([]);
    
    useEffect(() => {
        if (id && type) {
            fetchEntityName();
            fetchRelationships();
        }
    }, [fetchEntityName, fetchRelationships, id, type]);

    useEffect(() => {
        const fetchProfilesData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Unauthorized - please log in again.");
                const parents = await getUsersByAccountTypeAndLocation("Parent", user.locationID);
                const children = await retrieveChildrenByLocationID(user.locationID);

                setParentProfiles(parents.users || []);
                setChildProfiles(children || []);
            } catch (error) {
                console.error("Error fetching profiles:", error);
                setParentProfiles([]);
                setChildProfiles([]);
            }
        };

        fetchProfilesData();
    }, [user]);

    const fetchEntityName = useCallback(async () => {
        try {
            if (type === "parent") {
                const parent = await retrieveUserByIDInDynamoDB(id);
                setEntityName(`${parent.user.user.firstName} ${parent.user.user.lastName}`);
            } else if (type === "child") {
                const child = await retrieveChildProfileByID(id);
                setEntityName(`${child.child.child.firstName} ${child.child.child.lastName}`);
            }
        } catch (error) {
            console.error("Error loading entity name:", error); 
        }
    },[id, type]);

    const fetchRelationships = useCallback(async () => {
        try {
            let data = [];
            if (type === "parent") {
                data = await getRelationshipByParentID(id);
            } else if (type === "child") {
                data = await getRelationshipByChildID(id);
            }

            const enrichedRelationships = await Promise.all(
                data.map(async (relation) => {
                    if (type === "parent") {
                        const child = await retrieveChildProfileByID(relation.childID);
                        return {
                            ...relation,
                            title: `${child.child.child.firstName} ${child.child.child.lastName}`, // Child's name
                            classID: `${child.child.child.classID}`,
                        };
                    } else if (type === "child") {
                        const parent = await retrieveUserByIDInDynamoDB(relation.parentID);
                        const child = await retrieveChildProfileByID(relation.childID);
                        return {
                            ...relation,
                            title: `${parent.user.user.firstName} ${parent.user.user.lastName}`, // Parent's name

                        };
                    }
                    return relation;
                })
            );

            setRelationships(enrichedRelationships || []);
        } catch (error) {
            console.error("Error loading relationships. Please try again.");
        }
    }, [id, type]);

    const handleDeleteClick = (relationshipID) => {
        setDeleteRelation(relationshipID);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteRelation) {
            try {
                await deleteRelationshipFromDynamoDB(deleteRelation);
                setDeleteRelation("");
                setShowDeleteDialog(false);
                fetchRelationships(); 
            } catch (error) {
                setErrorMessage(`Error deleting relationship: ${error.message}`);
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setSelectedReportForDelete(null);
    };


    const handleUpdate = (relation) => {
        setEditingRelation({ ...relation });
    };

    const handleSaveUpdate = async () => {
        try {
            await updateRelationshipInDynamoDB(editingRelation.relationshipID, editingRelation);
            setEditingRelation(null);
            window.location.reload();
        } catch (error) {
            setErrorMessage("Failed to update relationship. Please try again.");
        }
    };

    const handleEditChange = (field, value) => {
        setEditingRelation((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                mt: 4,
                p: 3,
                backgroundColor: "#E3F2FD",
                borderRadius: 2,
                boxShadow: 3,
                mb: 4,
            }}
        >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ color: "#1565C0", fontWeight: "bold" }}
            >
                  {`${entityName}'s Relationships`}
            </Typography>

            {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage("")}>
                    {errorMessage}
                </Alert>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {relationships.length > 0 ? (
                    relationships.map((relation) => (
                        <Card
                            key={relation.relationshipID}
                            sx={{
                                width: 300,
                                backgroundColor: "#FFF",
                                boxShadow: 3,
                            }}
                        >
                             <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {relation.title || "Relationship"}
                    </Typography>

                    {/* If the query is for a child, display parent's details */}
                    {type === "child" ? (
                        <>
                            <Typography variant="body2" color="textSecondary">
                                Child&apos;s Relation: {relation.childRelation || "No relation available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Adult&apos;s Relation: {relation.parentRelation || "No relation available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Adult&apos;s Email: {relation.email || "No email available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Adult&apos;s Phone: {relation.phoneNumber || "No phone available"}
                            </Typography>
                        </>
                    ) : (
                        <>
                            {/* Default for "parent" type, show child's relation */}
                            <Typography variant="body2" color="textSecondary">
                                Class ID: {relation.classID || "No class available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Adult&apos;s Relation: {relation.parentRelation || "No relation available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Child&apos;s Relation: {relation.childRelation || "No relation available"}
                            </Typography>
                        </>
                    )}
                </CardContent>
                <CardActions>
                  {/* Render buttons only if user.accountType is "Admin" */}
                  {user.accountType === "Admin" && (
                    <>
                      {/* Update Button */}
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleUpdate(relation)}
                      >
                        Update
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleDeleteClick(relation.relationshipID)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
            </Card>
        ))
                ) : (
                    <Typography variant="body1" color="textSecondary">
                        No relationships found.
                    </Typography>
                )}
            </Box>

            <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push("/admin/relationship")}
                sx={{ textTransform: "none", mt: 4 }}
            >
                Back
            </Button>
            <Dialog
                open={!!editingRelation}
                onClose={() => setEditingRelation(null)}
                aria-labelledby="update-dialog-title"
                aria-describedby="update-dialog-description"
            >
                <DialogTitle id="update-dialog-title">Update Relationship</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                    <Select
                        fullWidth
                        value={editingRelation?.parentID || ""}
                        onChange={(e) => handleEditChange("parentID", e.target.value)}
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Select Parent
                        </MenuItem>
                        {parentProfiles.map((parent) => (
                            <MenuItem key={parent.userID} value={parent.userID}>
                                {`${parent.firstName} ${parent.lastName}`}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        fullWidth
                        value={editingRelation?.childID || ""}
                        onChange={(e) => handleEditChange("childID", e.target.value)}
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Select Child
                        </MenuItem>
                        {childProfiles.map((child) => (
                            <MenuItem key={child.childID} value={child.childID}>
                                {`${child.firstName} ${child.lastName}`}
                            </MenuItem>
                        ))}
                    </Select>
                    
                    <TextField
                        fullWidth
                        label="Parent Relation"
                        value={editingRelation?.parentRelation || ""}
                        onChange={(e) => handleEditChange("parentRelation", e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Child Relation"
                        value={editingRelation?.childRelation || ""}
                        onChange={(e) => handleEditChange("childRelation", e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Phone Number"
                        value={editingRelation?.phoneNumber || ""}
                        onChange={(e) => handleEditChange("phoneNumber", e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingRelation(null)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveUpdate} color="secondary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={showDeleteDialog}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this relationship? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
