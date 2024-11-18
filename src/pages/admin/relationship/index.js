import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUsersByAccountTypeAndLocation } from "../../../utils/userAPI"; 
import { retrieveChildrenByLocationID } from "../../../utils/childAPI";
import { useUser } from "@/components/authenticate";
import {
    Container,
    Typography,
    Select,
    Button,
    Alert,
    Box,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";

export default function ParentAccountsLanding() {
    const router = useRouter();
    const user = useUser();
    const [parentID, setParentID] = useState("");
    const [childID, setChildID] = useState("");
    const [message, setMessage] = useState("");
    const [parentProfiles, setParentProfiles] = useState([]);
    const [childProfiles, setChildProfiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchProfilesData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Unauthorized - please log in again.");
                }

                const parents = await getUsersByAccountTypeAndLocation("Parent", user.locationID);
                setParentProfiles(parents.users || []);

                const children = await retrieveChildrenByLocationID(user.locationID);
                setChildProfiles(children || []);;

            } catch (error) {
                if (error.message.includes("Unauthorized")) {
                    setMessage("Session expired. Redirecting to login...");
                    localStorage.removeItem("token");
                    setTimeout(() => {
                        router.push("/login");
                    }, 2000);
                }
                setParentProfiles([]);
                setChildProfiles([]);
            }
        };
        fetchProfilesData();
    }, [user, router]);

    const handleViewParentRelation = (e) => {
        e.preventDefault();
        if (!parentID) {
            setErrorMessage("Please select a parent before proceeding.");
            setOpenModal(true);
            return;
        }
        setErrorMessage(""); // Clear previous errors
        if (user.accountType === "Admin"){
            router.push(`/admin/relationship/${parentID}?type=parent`);
        } else if (user.accountType === "Staff") {
            router.push(`/relationship/${parentID}?type=parent`);
        }
    };

    const handleViewChildRelation = (e) => {
        e.preventDefault();
        if (!childID) {
            setErrorMessage("Please select a child before proceeding.");
            setOpenModal(true);
            return;
        }
        setErrorMessage(""); // Clear previous errors
        if (user.accountType === "Admin"){
            router.push(`/admin/relationship/${childID}?type=child`);
        } else if (user.accountType === "Staff") {
            router.push(`/relationship/${childID}?type=child`);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <Container
            maxWidth="sm"
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
                Relationships
            </Typography>

            {message && (
                <Alert severity="info" onClose={() => setMessage("")}>
                    {message}
                </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Select
                    label="Select Parent"
                    value={parentID}
                    onChange={(e) => setParentID(e.target.value)}
                    fullWidth
                    displayEmpty
                    required
                >
                    <MenuItem value="">
                        <em>Select an adult</em>
                    </MenuItem>
                    {Array.isArray(parentProfiles) && parentProfiles.length > 0 ? (
                        parentProfiles.map((parent) => (
                            <MenuItem key={parent.userID} value={parent.userID}>
                                {parent.firstName} {parent.lastName}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No parents available</MenuItem>
                    )}
                </Select>
                
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleViewParentRelation}
                    sx={{ textTransform: "none" }}
                >
                    View Adult&apos;s Relationships
                </Button>

                <Select
                    label="Select Child"
                    value={childID}
                    onChange={(e) => setChildID(e.target.value)}
                    fullWidth
                    displayEmpty
                    required
                >
                    <MenuItem value="">
                        <em>Select a child</em>
                    </MenuItem>
                    {Array.isArray(childProfiles) && childProfiles.length > 0 ? (
                        childProfiles.map((child) => (
                            <MenuItem key={child.childID} value={child.childID}>
                                {child.firstName} {child.lastName}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No children available</MenuItem>
                    )}
                </Select>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleViewChildRelation}
                    sx={{ textTransform: "none" }}
                >
                    View Child&apos;s Relationships
                </Button>

                
            </Box>
            <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push("/admin")}
                sx={{ textTransform: "none", mt: 2 }}
            >
                Back to Admin
            </Button>

            <Button
                variant="contained"
                color="success"  
                onClick={() => router.push("/admin/relationship/create")}  // Redirect to create relationship page
                sx={{ textTransform: "none", mt: 2, ml: 32.8 }}
            >
                Create Relationship
            </Button>

            {/* Modal for error message */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Alert severity="error">{errorMessage}</Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
