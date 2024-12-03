import { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getCurrentUser } from "../../utils/api";
import { retrieveChildrenByLocationID } from "../../utils/childAPI";

const StaffChildProfiles = () => {
  const [locationID, setLocationID] = useState("");
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState(1); // Current page state
  const pageLimit = 5; // Number of children per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser(); // Assumes this function gets the current user's info
        const userLocationID = user.locationID.toUpperCase();
        setLocationID(userLocationID);

        const childrenEntries = await retrieveChildrenByLocationID(
          userLocationID
        );
        setChildren(childrenEntries); // Set children data
      } catch (err) {
        setError("Failed to load children data.");
      }
    };

    fetchData();
    setIsClient(true);
  }, []);

  // Calculate paginated children
  const paginatedChildren = children.slice(
    (page - 1) * pageLimit,
    page * pageLimit
  );

  const handleNextPage = () => {
    const nextPage = page + 1;
    if ((nextPage - 1) * pageLimit < children.length) {
      setPage(nextPage);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = Math.max(page - 1, 1);
    setPage(prevPage);
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: "30px" }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: "bold", marginBottom: "20px" }}
      >
        Children Lookup
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: "20px" }}>
          {error}
        </Alert>
      )}

      <div style={{ textAlign: "left" }}>
        {paginatedChildren.length > 0 ? (
          paginatedChildren.map((child) => (
            <Accordion
              key={child.childID}
              sx={{
                marginBottom: "10px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`child-${child.childID}-content`}
                id={`child-${child.childID}-header`}
                sx={{ backgroundColor: "#f7f7f7", padding: "0 16px" }}
              >
                <Typography sx={{ fontSize: "1rem", fontWeight: "500" }}>
                  {child.lastName}, {child.firstName}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: "#ffffff", padding: "16px" }}>
                <Typography>
                  <strong>Child ID:</strong> {child.childID}
                </Typography>
                <Typography>
                  <strong>Age:</strong> {child.age}
                </Typography>
                <Typography>
                  <strong>Birth Date:</strong>{" "}
                  {new Date(child.birthDate).toLocaleDateString()}
                </Typography>
                <Typography>
                  <strong>Class ID:</strong> {child.classID}
                </Typography>
                <Typography>
                  <strong>Location ID:</strong> {child.locationID}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: "red", marginTop: "10px" }}>
            No results found.
          </Typography>
        )}
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
          gap: "10px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Typography>Page: {page}</Typography>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={page * pageLimit >= children.length}
        >
          Next
        </Button>
      </div>
    </Container>
  );
};

export default StaffChildProfiles;
