import { useState, useEffect } from "react";
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
  createChildProfileInDynamoDB,
} from "../../utils/childAPI"; // Adjust the path if necessary
import { useUser } from "@/components/authenticate";

const AdminChild = () => {
  const [searchOption, setSearchOption] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [createData, setCreateData] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteChildID, setDeleteChildID] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const resultsPerPage = 3;
  const user = useUser();

  useEffect(() => {
    handleSearch(); // Run the search when the component mounts (initial loading)
  }, []);

  const handleSearchOptionChange = (event) => {
    setSearchOption(event.target.value);
    setSearchTerm("");
    setCurrentPage(1);
    setExpandedCard(null);
  };

  const handleSearchTermChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => {
      const updatedData = { ...prev, [field]: value };
      if (field === "birthDate") {
        const today = new Date();
        const selectedDate = new Date(value);
        if (selectedDate > today) {
          setSnackbar({
            open: true,
            message: "Birth date cannot be greater than today's date.",
            severity: "error",
          });
          return prev;
        }
        updatedData.age = calculateAge(value);
      }
      return updatedData;
    });
  };

  const handleCreateInputChange = (field, value) => {
    setCreateData((prev) => {
      const updatedData = { ...prev, [field]: value };
      if (field === "birthDate") {
        const today = new Date();
        const selectedDate = new Date(value);
        if (selectedDate > today) {
          setSnackbar({
            open: true,
            message: "Birth date cannot be greater than today's date.",
            severity: "error",
          });
          return prev;
        }
        updatedData.age = calculateAge(value);
      }
      return updatedData;
    });
  };

  const handleSearch = async () => {
    try {
      let result;
        result = await retrieveChildrenByLocationID(user.locationID); // Fetch all children for user's location
      
      if (searchOption === "Class ID") {
        result = result.filter((child) => child.classID === searchTerm); // Filter by classID if searchTerm is provided
      } else if (searchOption === "Child's First Name") {
        result = result.filter((child) => child.firstName === searchTerm);
      } else if (searchOption === "Child's Last Name") {
        result = result.filter((child) => child.lastName === searchTerm);
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
      //console.error("Error performing search:", error.message);
      setSearchResult([]);
    }
  };

  const handleExpandClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
    setIsEditing(false);
  };

  const handleCreateButtonClick = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreateButtonClick = () => {
    setShowCreateForm(false);
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

  const handleCreate = async () => {
    try {
      await createChildProfileInDynamoDB(createData);
      setSnackbar({ open: true, message: "Child created successfully!", severity: "success" });
      setCreateData({});
      handleSearch();
      setShowCreateForm(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error creating profile. Please check all fields.",
        severity: "error",
      });
    }
  };

  const handleSave = async (childID) => {
    try {
      const updatedData = { ...editData };
      delete updatedData.childID;

      await updateChildProfileInDynamoDB(childID, updatedData);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
      setIsEditing(false);
      handleSearch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error saving edits. Please check fields are all filled in.",
        severity: "error",
      });
    }
  };

  const handleHideSearchResults = () => {
    setSearchResult(null);
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
          <MenuItem value="All">All Children At This Location</MenuItem>
          <MenuItem value="Class ID">Class ID</MenuItem>
          <MenuItem value="Child's First Name">Child First Name</MenuItem>
          <MenuItem value="Child's Last Name">Child Last Name</MenuItem>
        </Select>
      </FormControl>


      {searchOption !== "All" && (
        <TextField
          label={`Enter ${searchOption}`}
          variant="outlined"
          sx={{ width: "50%" }}
          value={searchTerm}
          onChange={handleSearchTermChange}
          placeholder={`Search by ${searchOption}`}
        />
      )}

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSearch} 
        disabled={(searchOption !== "All" && !searchTerm)}>
        Search
      </Button>

      {!showCreateForm && (
        <Button variant="contained" color="primary" onClick={handleCreateButtonClick}>
          Create Child Profile
        </Button>
      )}

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
                  <Box onClick={() => handleExpandClick(index)}>
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
                  </Box>
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
                            type="date"
                            value={editData.birthDate || ""}
                            onChange={(e) => handleInputChange("birthDate", e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <TextField
                            label="Age"
                            value={editData.age || ""}
                            disabled
                            fullWidth
                            sx={{ mb: 2 }}
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
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleHideSearchResults}
                >
                  Clear Search Results
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      {showCreateForm && (
        <Box sx={{ width: "50%", mt: 3 }}>
          <Typography variant="h5">Create New Child Profile</Typography>
          <TextField
            label="First Name"
            value={createData.firstName || ""}
            onChange={(e) => handleCreateInputChange("firstName", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Last Name"
            value={createData.lastName || ""}
            onChange={(e) => handleCreateInputChange("lastName", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Class ID"
            value={createData.classID || ""}
            onChange={(e) => handleCreateInputChange("classID", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Location ID"
            value={user.locationID || ""}
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Birth Date"
            type="date"
            value={createData.birthDate || ""}
            onChange={(e) => handleCreateInputChange("birthDate", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Age"
            value={createData.age || ""}
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, marginBottom: 4 }}>
            <Button variant="contained" color="primary" onClick={handleCancelCreateButtonClick}>
              Cancel Creation
            </Button>
            <Button variant="contained" color="success" onClick={handleCreate}>
              Confirm Create
            </Button>
          </Box>
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

export default AdminChild;
