import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createRelationshipInDynamoDB, getRelationshipByParentID
 } from "../../../utils/relationshipAPI";
import { getUsersByAccountTypeAndLocation } from "../../../utils/userAPI";
import { retrieveChildrenByLocationID } from "../../../utils/childAPI";
import { useUser } from "@/components/authenticate";
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

export default function CreateRelationshipPage() {
  const router = useRouter();
  const user = useUser();

  const [childID, setChildID] = useState("");
  const [parentID, setParentID] = useState("");
  const [parentRelation, setParentRelation] = useState("");
  const [childRelation, setChildRelation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [parentsList, setParentsList] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  useEffect(() => {
    if (user && !(user.accountType === "Admin" || user.accountType === "Staff")) {
      setOpenErrorDialog(true); 
      setTimeout(() => {
        router.push("/"); 
      }, 3000);
    }
  }, [user, router]);


  useEffect(() => {
    if (user.locationID) {
      const fetchLocationData = async () => {
        try {
          const parents = await getUsersByAccountTypeAndLocation("Parent", user.locationID);
          setParentsList(parents.users || []);
          const children = await retrieveChildrenByLocationID(user.locationID);
          setChildrenList(children || []);
        } catch (error) {
          setMessage(`Error fetching location data: ${error.message}`);
        }
      };

      fetchLocationData();
    }
  }, [user.locationID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = user.userID;

    if (!createdBy) {
      setMessage("User is not authenticated.");
      return router.push("/login");
    }

    try {

      const existingRelationships = await getRelationshipByParentID(parentID);

      if (
        existingRelationships.some(
          (relationship) => relationship.childID === childID
        )
      ) {
        setMessage("A Relationship between this Parent and Child already exists.");
        return;
      }

      const parentEmail = parentsList.find((parent) => parent.userID === parentID)?.email;

      const newRelationship = {
        childID,
        parentID,
        parentRelation,
        childRelation,
        phoneNumber,
        email: parentEmail,
        locationID: user.locationID,
      };

      await createRelationshipInDynamoDB(newRelationship);
      setMessage("Relationship created successfully");
      router.push(`/admin/relationship/${childID}?type=child`);

    } catch (error) {
      setMessage(`Error creating relationship: ${error.message}`);
    }
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
        Create Relationship
      </Typography>

      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
      >
        <Alert
          onClose={() => setMessage("")}
          severity={message.includes("successfully") ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
      

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Parent Selection */}
        <FormControl fullWidth required>
        <InputLabel>Adult</InputLabel>
        <Select
            label="Select Parent"
            value={parentID}
            onChange={(e) => setParentID(e.target.value)}
            fullWidth
            displayEmpty
            required
        >
            {Array.isArray(parentsList) && parentsList.length > 0 ? (
                parentsList.map((parent) => (
                    <MenuItem key={parent.userID} value={parent.userID}>
                        {parent.firstName} {parent.lastName}
                    </MenuItem>
                ))
            ) : (
                <MenuItem disabled>No Adults available</MenuItem>
            )}
        </Select>
        </FormControl>

        {/* Child Selection */}
        <FormControl fullWidth required>
          <InputLabel>Child</InputLabel>
          <Select
                    label="Select Child"
                    value={childID}
                    onChange={(e) => setChildID(e.target.value)}
                    fullWidth
                    displayEmpty
                    required
                >
                    {Array.isArray(childrenList) && childrenList.length > 0 ? (
                        childrenList.map((child) => (
                            <MenuItem key={child.childID} value={child.childID}>
                                {child.firstName} {child.lastName}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No children available</MenuItem>
                    )}
                </Select>

        </FormControl>

        <TextField
          label="Adult Relation"
          value={parentRelation}
          onChange={(e) => setParentRelation(e.target.value)}
          required
        />

        <TextField
          label="Child Relation"
          value={childRelation}
          onChange={(e) => setChildRelation(e.target.value)}
          required
        />

        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#3498db",
            color: "#fff",
            "&:hover": { backgroundColor: "#2980b9" },
          }}
        >
          Create Relationship
        </Button>

        <Button
          variant="outlined"
          fullWidth
          sx={{
            color: "#3498db",
            borderColor: "#3498db",
            "&:hover": { borderColor: "#2980b9", color: "#2980b9" },
          }}
          onClick={() => router.back()}
        >
          Previous Page
        </Button>
      </Box>

      {/* Unauthorized Access Dialog */}
      <Dialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">Unauthorized Access</DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="error-dialog-description">
            You are not authorized to create relationships. Redirecting to the homepage...
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
