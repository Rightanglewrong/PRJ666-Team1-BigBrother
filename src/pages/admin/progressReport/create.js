import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {createProgressReportInDynamoDB} from "../../../utils/progressReportAPI"
import { retrieveChildProfileByID }from "../../../utils/childAPI"
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
    DialogActions,
} from "@mui/material"; 

export default function CreateProgressReportPage() {
    const router = useRouter();
    const user = useUser();
    
    const [childID, setChildID] = useState("");
    const [reportTitle, setReportTitle] = useState("");
    const [reportContent, setReportContent] = useState("");
    const [message, setMessage] = useState("");
    const [childName, setChildName] = useState("");    
    const [reportType, setReportType] = useState("simplified");
    const [subject, setSubject] = useState("");
    const [progressTrending, setProgressTrending] = useState("");
    const [details, setDetails] = useState("");
    const [recommendedActivity, setRecommendedActivity] = useState("");

    const [openErrorDialog, setOpenErrorDialog] = useState(false);

    useEffect(() => {
      if (user && !(user.accountType === "Admin" || user.accountType === "Staff")) {
        setOpenErrorDialog(true); // Show the error dialog
        setTimeout(() => {
          router.push("/"); // Redirect to home after a timeout
        }, 3000);
      }
    }, [user, router]);

    const isFormDisabled = openErrorDialog;
  
    useEffect(() => {
      if (router.query.childID) {
        setChildID(router.query.childID);  
      }
    }, [router.query.childID]);


    useEffect(() => {
      if (childID) {
        const fetchChildProfile = async () => {
          try {
            const profile = await retrieveChildProfileByID(childID);
            setChildName(profile.child.child.firstName + " " + profile.child.child.lastName); // Set the child name
          } catch (error) {
            setMessage(`Error fetching child profile: ${error.message}`);
          }
        };
  
        fetchChildProfile();
      }
    }, [childID]);
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        const createdBy = user.userID;
    
        if (!createdBy) {
          setMessage("User is not authenticated.");
          return router.push("/login");
        }
    
        try {
          let content;

          if (reportType === "detailed") {
              content = `${subject} | ${progressTrending} | ${details} | ${recommendedActivity}`;
          } else {
            content = reportContent;
          }

          const newReport = {
            childID,
            reportTitle,
            content: content,
            createdBy,
            locationID: user.locationID
          };
          await createProgressReportInDynamoDB(newReport);
          setMessage("Progress Report created successfully");
          router.push(`/admin/progressReport/child?childID=${childID}`); 

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
        <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage("")}>
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
          label="Child Name"
          value={childName}
          required
          disabled
        >
        </TextField>

        <FormControl fullWidth required>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            label="Report Type"
          >
            <MenuItem value="simplified">Simplified</MenuItem>
            <MenuItem value="detailed">Detailed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Report Title"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          required
        />

        

        {reportType === "detailed" ? (
  <>
    <TextField
      label="Subject"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
      required
    />
    <TextField
      label="Progress Trending"
      value={progressTrending}
      onChange={(e) => setProgressTrending(e.target.value)}
      required
    />
    <TextField
      label="Details"
      multiline
      rows={4}
      value={details}
      onChange={(e) => setDetails(e.target.value)}
      required
    />
    <TextField
      label="Recommended Activity for Improvement"
      multiline
      rows={4}
      value={recommendedActivity}
      onChange={(e) => setRecommendedActivity(e.target.value)}
      required
    />
  </>
) : (
  <TextField
    label="Content"
    multiline
    rows={4}
    value={reportContent}
    onChange={(e) => setReportContent(e.target.value)}
    required
  />
)}
        
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
          Create Progress Report
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
            You are not authorized to create progress reports. Redirecting to the homepage...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => router.push("/")}
            color="primary"
            variant="contained"
          >
            Go to Homepage
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}