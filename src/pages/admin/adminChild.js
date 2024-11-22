import { useState } from "react";
import {
  TextField,
  Typography,
  Box,
  MenuItem,
  Button,
  FormControl,
  Select,
  InputLabel,
  Card,
  CardContent,
  CardActionArea,
  Collapse,
  IconButton,
  Pagination,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  retrieveChildProfileByID,
  retrieveChildrenByClassID,
  retrieveChildrenByLocationID,
  updateChildProfileInDynamoDB,
  deleteChildProfileFromDynamoDB,
} from "../../utils/childAPI"; // Adjust the path if necessary

const AdminChild = () => {
  const [searchOption, setSearchOption] = useState("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteChildID, setDeleteChildID] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const resultsPerPage = 3;

  const handleSearchOptionChange = (event) => {
    setSearchOption(event.target.value);
    setSearchTerm("");
    setSearchResult(null);
    setCurrentPage(1);
    setExpandedCard(null);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = async () => {
    try {
      let result;
      if (searchOption === "id") {
        result = await retrieveChildProfileByID(searchTerm);
      } else if (searchOption === "class") {
        result = await retrieveChildrenByClassID(searchTerm);
      } else if (searchOption === "location") {
        result = await retrieveChildrenByLocationID(searchTerm);
      }

      if (result && result.child && result.child.success) {
        setSearchResult([result.child.child]);
      } else if (Array.isArray(result)) {
        setSearchResult(result);
      } else {
        setSearchResult([]);
      }

      setCurrentPage(1);
      setExpandedCard(null);
    } catch (error) {
      console.error("Error performing search:", error.message);
      setSearchResult([]);
    }
  };

  const handleExpandClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
    setIsEditing(false);
  };

  const handleEditClick = (item) => {
    setEditData({
      childID: item.childID,
      firstName: item.firstName,
      lastName: item.lastName,
      classID: item.classID,
      locationID: item.locationID,
      birthDate: item.birthDate,
      age: item.age,
    });
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (childID) => {
    try {
      const updatedData = { ...editData };
      delete updatedData.childID; // Ensure childID is not sent to the API if unnecessary
  
      await updateChildProfileInDynamoDB(childID, updatedData);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" }); // Success notification
      setIsEditing(false); // Exit edit mode
      handleSearch(); // Refresh the search results
    } catch (error) {
      // Custom error message
      setSnackbar({
        open: true,
        message: "Error saving edits. Please check fields are all filled in.",
        severity: "error",
      });
    }
  };
  
  

  const handleDeleteClick = (childID) => {
    setDeleteChildID(childID);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteInput === "DELETE") {
      try {
        await deleteChildProfileFromDynamoDB(deleteChildID);
        setSnackbar({ open: true, message: "Profile deleted successfully!", severity: "success" });
        setDeleteConfirmOpen(false);
        setDeleteInput("");
        handleSearch();
      } catch (error) {
        setSnackbar({ open: true, message: `Error deleting profile: ${error.message}`, severity: "error" });
      }
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const paginatedResults =
    searchResult &&
    searchResult.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography variant="h4" component="h1">Search for Child Profile</Typography>

      <FormControl sx={{ width: "50%" }}>
        <InputLabel>Search By</InputLabel>
        <Select value={searchOption} onChange={handleSearchOptionChange}>
          <MenuItem value="id">Child ID</MenuItem>
          <MenuItem value="class">Class ID</MenuItem>
          <MenuItem value="location">Location ID</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label={`Enter ${searchOption === "id" ? "Child ID" : searchOption === "class" ? "Class ID" : "Location ID"}`}
        variant="outlined"
        sx={{ width: "50%" }}
        value={searchTerm}
        onChange={handleSearchTermChange}
        placeholder={`Search by ${searchOption}`}
      />

      <Button variant="contained" color="primary" onClick={handleSearch} disabled={!searchTerm}>
        Search
      </Button>

      {searchResult && (
        <Box sx={{ mt: 4, width: "50%" }}>
          {searchResult.length === 0 ? (
            <Typography variant="h6" color="textSecondary" align="center">
              No results found.
            </Typography>
          ) : (
            <>
              <Typography variant="h6">Search Results:</Typography>
              {paginatedResults.map((item, index) => (
                <Card key={index} sx={{ mb: 2, backgroundColor: "#f5f5f5" }}>
                  <CardActionArea onClick={() => handleExpandClick(index)}>
                    <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {item.lastName}, {item.firstName}
                      </Typography>
                      <IconButton
                        sx={{
                          transform: expandedCard === index ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandClick(index);
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </CardContent>
                  </CardActionArea>
                  <Collapse in={expandedCard === index} timeout="auto" unmountOnExit>
                    <CardContent>
                      {!isEditing ? (
                        <>
                          <Typography variant="body2"><strong>Child ID:</strong> {item.childID}</Typography>
                          <Typography variant="body2"><strong>First Name:</strong> {item.firstName}</Typography>
                          <Typography variant="body2"><strong>Last Name:</strong> {item.lastName}</Typography>
                          <Typography variant="body2"><strong>Class ID:</strong> {item.classID}</Typography>
                          <Typography variant="body2"><strong>Location ID:</strong> {item.locationID}</Typography>
                          <Typography variant="body2"><strong>Birth Date:</strong> {item.birthDate}</Typography>
                          <Typography variant="body2"><strong>Age:</strong> {item.age}</Typography>
                          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <Button variant="outlined" color="primary" onClick={() => handleEditClick(item)}>
                              Edit Profile
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={() => handleDeleteClick(item.childID)}>
                              Delete Profile
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <>
                          <TextField label="Child ID" value={editData.childID} disabled fullWidth sx={{ mb: 2 }} />
                          <TextField
                            label="First Name"
                            value={editData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            fullWidth sx={{ mb: 2 }}
                          />
                          <TextField
                            label="Last Name"
                            value={editData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            fullWidth sx={{ mb: 2 }}
                          />
                          <TextField
                            label="Class ID"
                            value={editData.classID}
                            onChange={(e) => handleInputChange("classID", e.target.value)}
                            fullWidth sx={{ mb: 2 }}
                          />
                          <TextField
                            label="Location ID"
                            value={editData.locationID}
                            onChange={(e) => handleInputChange("locationID", e.target.value)}
                            fullWidth sx={{ mb: 2 }}
                          />
                          <TextField
                            label="Birth Date"
                            value={editData.birthDate}
                            onChange={(e) => handleInputChange("birthDate", e.target.value)}
                            fullWidth sx={{ mb: 2 }}
                          />
                          <TextField
                            label="Age"
                            value={editData.age}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            fullWidth sx={{ mb: 2 }}
                          />
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => handleSave(editData.childID)}>
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                setIsEditing(false);
                                setEditData({});
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Collapse>
                </Card>
              ))}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={Math.ceil(searchResult.length / resultsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To confirm deletion, please type &quot;DELETE&quot; in the box below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Type DELETE to confirm"
            fullWidth
            variant="outlined"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="secondary" disabled={deleteInput !== "DELETE"}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
const handleSave = async (childID) => {
  try {
    const updatedData = { ...editData };
    delete updatedData.childID; // Ensure childID is not sent to the API if unnecessary

    await updateChildProfileInDynamoDB(childID, updatedData);
    setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" }); // Success notification
    setIsEditing(false); // Exit edit mode
    handleSearch(); // Refresh the search results
  } catch (error) {
    setSnackbar({ open: true, message: `Error updating profile: ${error.message}`, severity: "error" }); // Error notification
  }
};

export default AdminChild;
