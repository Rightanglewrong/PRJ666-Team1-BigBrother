import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Collapse,
  IconButton,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { retrieveChildProfileByID } from "../utils/childAPI";
import { getRelationshipByParentID } from "../utils/relationshipAPI";
import { useRouter } from "next/router";

const UserChildren = () => {
  const [children, setChildren] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const resultsPerPage = 3;
  const router = useRouter();
  const isInitialMount = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isInitialMount.current) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the token
        const userID = decodedToken.userID; // Extract the userID
        if (userID) {
          fetchChildrenProfiles(userID); // Fetch child profiles
        }
        isInitialMount.current = false; // Mark as not the initial mount
      } catch (error) {
        console.error("Error decoding token:", error);
        setSnackbar({ open: true, message: "Invalid token. Please log in again.", severity: "error" });
        router.push("/login"); // Redirect to login page if token is invalid
      }
    } else if (!token) {
      router.push("/login"); // Redirect to login page if no token is found
    }
  }, [router]);

  const fetchChildrenProfiles = async (parentID) => {
    try {
      const relationships = await getRelationshipByParentID(parentID); // Fetch relationships
      const childProfiles = await Promise.all(
        relationships.map(async (rel) => {
          const response = await retrieveChildProfileByID(rel.childID); // Fetch child profile
          if (response.child?.success) {
            return response.child.child; // Extract the child object
          }
          return null; // Skip if no child data is returned
        })
      );
      setChildren(childProfiles.filter((profile) => profile !== null)); // Filter out null responses
    } catch (error) {
      console.error("Error fetching child profiles:", error);
      setSnackbar({ open: true, message: "Error fetching child profiles.", severity: "error" });
    }
  };
  

  const handleExpandClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const paginatedResults =
    children.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography variant="h4" component="h1">User&apos;s Children Profiles</Typography>
      
      {children.length === 0 ? (
        <Typography variant="h6" color="textSecondary" align="center">
          No child profiles found for the user.
        </Typography>
      ) : (
        <Box sx={{ width: "50%", mt: 4 }}>
          {paginatedResults.map((child, index) => (
            <Card key={index} sx={{ mb: 2, backgroundColor: "#f5f5f5" }}>
              <CardActionArea onClick={() => handleExpandClick(index)}>
                <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {child.lastName}, {child.firstName}
                  </Typography>
                  <IconButton
                    sx={{
                      transform: expandedCard === index ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardContent>
              </CardActionArea>
              <Collapse in={expandedCard === index} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography variant="body2"><strong>Child ID:</strong> {child.childID}</Typography>
                  <Typography variant="body2"><strong>First Name:</strong> {child.firstName}</Typography>
                  <Typography variant="body2"><strong>Last Name:</strong> {child.lastName}</Typography>
                  <Typography variant="body2"><strong>Birth Date:</strong> {child.birthDate}</Typography>
                  <Typography variant="body2"><strong>Age:</strong> {child.age}</Typography>
                </CardContent>
              </Collapse>
            </Card>
          ))}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={Math.ceil(children.length / resultsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserChildren;
