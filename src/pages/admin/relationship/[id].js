import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getRelationshipByChildID, getRelationshipByParentID } from "../../../utils/relationshipAPI";
import { retrieveUserByIDInDynamoDB } from "../../../utils/userAPI";
import { retrieveChildProfileByID } from "../../../utils/childAPI";
import {
    Container,
    Typography,
    Box,
    Alert,
    Button,
    Card,
    CardContent, 
    CardActions,
  } from "@mui/material"; 

export default function Relationships() {
    const router = useRouter();
    const { id, type } = router.query; // `id` is the parentID or childID; `type` specifies "parent" or "child".
    const [relationships, setRelationships] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [entityName, setEntityName] = useState("");

    useEffect(() => {

        const fetchEntityName = async () => {
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
        };

        const fetchRelationships = async () => {
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
        };

        

        if (id && type) {
            fetchEntityName();
            fetchRelationships();
        }
    }, [id, type]);

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
                                Parent's Relation: {relation.parentRelation || "No relation available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Parent's Email: {relation.email || "No email available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Parent's Phone: {relation.phoneNumber || "No phone available"}
                            </Typography>
                        </>
                    ) : (
                        <>
                            {/* Default for "parent" type, show child's relation */}
                            <Typography variant="body2" color="textSecondary">
                                Class ID: {relation.classID || "No class available"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Child's Relation: {relation.childRelation || "No relation available"}
                            </Typography>
                        </>
                    )}
                </CardContent>
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
                onClick={() => router.back()}
                sx={{ textTransform: "none", mt: 4 }}
            >
                Back
            </Button>
        </Container>
    );
}
