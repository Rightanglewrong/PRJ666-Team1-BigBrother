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
    Alert,
    Box,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material"; 

export default function ProgressReportLanding() {
    const router = useRouter();
    const user = useUser();
    const [childID, setChildID] = useState("");
    const [message, setMessage] = useState("");
    const [childProfiles, setChildProfiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);

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
    
    const handleCreateProgressReport = (e) => {
      e.preventDefault();
      if (!childID) {
          setErrorMessage("Please select a child before proceeding.");
          setOpenModal(true);
          return; // Stop the navigation if no child is selected
      }
      setErrorMessage(""); // Clear any previous error
      router.push(`/admin/progressReport/create?childID=${childID}`);
  };

  // Handle the view all reports action
  const handleViewProgressReports = (e) => {
      e.preventDefault();
      if (!childID) {
          setErrorMessage("Please select a child before proceeding.");
          setOpenModal(true);
          return; // Stop the navigation if no child is selected
      }
      setErrorMessage(""); // Clear any previous error
      router.push(`/admin/progressReport/child?childID=${childID}`);
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
            
                <Alert severity="info" onClose={() => setMessage("")}>
                    {message}
                </Alert>
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
                onClick={handleCreateProgressReport}
                component={Link}
                href={`/admin/progressReport/create?childID=${childID}`} 
                sx={{ textTransform: "none" }}
              >
                Create Progress Report
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={handleViewProgressReports}
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

