import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {createProgressReportInDynamoDB} from "../../../utils/progressReportAPI"
import { retrieveChildrenByLocationID } from "../../../utils/childAPI";
import { useUser } from "@/components/authenticate";
import {
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Box,
} from "@mui/material"; 

export default function CreateProgressReportPage() {
    const router = useRouter();
    const user = useUser();
    const [childID, setChildID] = useState("");
    const [reportTitle, setReportTitle] = useState("");
    const [reportContent, setReportContent] = useState("");
    const [message, setMessage] = useState("");
    const [childProfiles, setChildProfiles] = useState([]);


    
      const handleSubmit = async (e) => {
        e.preventDefault();
        const createdBy = user.userID;
    
        if (!createdBy) {
          setMessage("User is not authenticated.");
          return router.push("/login");
        }
    
        try {
          const newReport = {
            childID,
            reportTitle,
            content: reportContent,
            createdBy,
          };
          await createProgressReportInDynamoDB(newReport);
          setMessage("Progress Report created successfully");
          router.push("/progressReport"); 
        } catch (error) {
          setMessage(`Error creating Progress Report: ${error.message}`);
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
        Create Progress Report
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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Child ID"
          select
          value={childID}
          onChange={(e) => setChildID(e.target.value)}
          SelectProps={{ native: true }}
          required
        >
          <option value="">Select a child</option>
          {childProfiles.map((child) => (
            <option key={child.childID} value={child.childID}>
              {child.firstName} {child.lastName}
            </option>
          ))}
        </TextField>
        <TextField
          label="Report Title"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          required
        />
        <TextField
          label="Content"
          multiline
          rows={4}
          value={reportContent}
          onChange={(e) => setReportContent(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "#3498db",
            color: "#fff",
            "&:hover": { backgroundColor: "#2980b9" },
          }}
        >
          Create Progress Report
        </Button>
      </Box>
    </Container>
  );
}