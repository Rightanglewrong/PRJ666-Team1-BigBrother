import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { retrieveChildrenByLocationID } from "../../../utils/childAPI";
import { useUser } from "@/components/authenticate";
import {
    Container,
    Typography,
    Select,
    Button,
    Snackbar,
    Alert,
    Box,
    MenuItem,
} from "@mui/material"; 

export default function ProgressReportLanding() {
    const router = useRouter();
    const user = useUser();
    const [childID, setChildID] = useState("");
    const [message, setMessage] = useState("");
    const [childProfiles, setChildProfiles] = useState([]);

    useEffect(() => {
      const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
              throw new Error("Unauthorized - please log in again.");
            }

            const children = await retrieveChildrenByLocationID(user.locationID);
            setChildProfiles(children);
            setMessage("");
          } catch (error) {
            if (error.message.includes("Unauthorized")) {
              setMessage("Session expired. Redirecting to login...");
              localStorage.removeItem("token");
              setTimeout(() => {
                router.push("/login");
              }, 2000); 
            } else {
              setMessage(error.message || "Error fetching the children by location.");
            }
            setChildProfiles(null);
        }
      };
      fetchUserData();
    }, [user, router]);
    
      

return (
    <Container
        maxWidth="sm"
        sx={{
            mt: 4,
            p: 3,
            backgroundColor: "#FFEBEE",
            borderRadius: 2,
            boxShadow: 3,
            mb: 4,
        }}
    >
        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2c3e50", fontWeight: "bold" }}>
            Children at this Location
        </Typography>

        {message && (
            <Snackbar
                open={Boolean(message)}
                autoHideDuration={6000}
                onClose={() => setMessage("")}
            >
                <Alert severity="info" onClose={() => setMessage("")}>
                    {message}
                </Alert>
            </Snackbar>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                    {childProfiles.map((child) => (
                        <MenuItem key={child.childID} value={child.childID}>
                            {child.firstName} {child.lastName}
                        </MenuItem>
                    ))}
                </Select>

              <Button
                variant="contained"
                color="success"
                component={Link}
                href={`/admin/progressReport/create?childID=${childID}`} 
                sx={{ textTransform: "none" }}
              >
                Create Progress Report
              </Button>

              <Button
                variant="contained"
                color="success"
                component={Link}
                href={`/admin/progressReport/child?childID=${childID}`} 
                sx={{ textTransform: "none" }}
              >
                View All Progress Reports
              </Button>

        </Box>
        <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push("/admin")} // Navigates to the admin page
                sx={{ textTransform: "none", mt: 2 }}
              >
                Back to Admin
              </Button>
    </Container>
  );
}

