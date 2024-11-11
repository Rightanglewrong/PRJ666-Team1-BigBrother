import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getNewsletter,
  updateNewsletter,
  deleteNewsletter,
} from "@/utils/newsletterAPI";
import { sendEmailsToUsers } from "@/utils/emailAPI";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useUser } from "@/components/authenticate";

export default function NewsletterDetailPage() {
  const user = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [newsletter, setNewsletter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete confirmation dialog

  const accountTypeOptions = ["Admin", "Staff", "Parent"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user) {
      setMessage("User is not authenticated");
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        if (id) {
          const data = await getNewsletter(token, id);
          setNewsletter(data.newsletter.newsletter);
          setLoading(false);
        }
      } catch (error) {
        setMessage("Error fetching newsletter details");
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountTypeChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAccountTypes((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((accountType) => accountType !== value)
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return;
    }

    try {
      await updateNewsletter(token, id, {
        title: newsletter.title,
        content: newsletter.content,
      });
      setMessage("Newsletter updated successfully");
      setEditMode(false);
    } catch (error) {
      setMessage("Error updating newsletter");
    }
  };

  const sendNewsletterViaEmail = async () => {
    setSendingEmail(true);
    const token = localStorage.getItem("token");
    const subject = newsletter.title;
    const content = newsletter.content;

    try {
      for (const accountType of selectedAccountTypes) {
        await sendEmailsToUsers(
          token,
          accountType,
          user.locationID,
          subject,
          content
        );
      }
      setMessage("Newsletter emailed successfully to selected users.");
    } catch (error) {
      setMessage("Error sending newsletter via email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    const token = localStorage.getItem("token");
    try {
      await deleteNewsletter(token, id);
      setMessage("Newsletter deleted successfully");
      setTimeout(() => router.push("/newsletter"), 500);
    } catch (error) {
      setMessage("Error deleting newsletter");
    }
  };

  const backToList = () => {
    router.push("/newsletter");
  };

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        p: 3,
        backgroundColor: "#f7f9fc",
        borderRadius: 2,
        boxShadow: 3,
        mb: 4,
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#2c3e50", fontWeight: "bold" }}
      >
        Newsletter Details
      </Typography>

      {message && (
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage("")}
        >
          <Alert severity="info">{message}</Alert>
        </Snackbar>
      )}

      {newsletter && (
        <Box>
          {editMode ? (
            <Box
              component="form"
              onSubmit={handleUpdate}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Title"
                name="title"
                value={newsletter.title}
                onChange={handleInputChange}
                required
                fullWidth
              />
              <TextField
                label="Content"
                name="content"
                value={newsletter.content}
                onChange={handleInputChange}
                required
                fullWidth
                multiline
                rows={6}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#3498db",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#2980b9" },
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={() => setEditMode(false)}
                sx={{ mt: 1 }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Title:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {newsletter.title}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Content:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {newsletter.content}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Published By:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {newsletter.publishedBy}
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Created At: {newsletter.createdAt}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Updated At: {newsletter.updatedAt}
              </Typography>

              {(user.accountType === "Admin" ||
                user.accountType === "Staff") && (
                <Button
                  variant="contained"
                  onClick={() => setEditMode(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Newsletter
                </Button>
              )}
              {user.accountType === "Admin" && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setOpenDeleteDialog(true)}
                    sx={{ mt: 2, ml: 2 }}
                  >
                    Delete
                  </Button>
                  <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                  >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Are you sure you want to delete this newsletter? This
                        action cannot be undone.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleDelete} color="error">
                        Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}

              {(user.accountType === "Admin" ||
                user.accountType === "Staff") && (
                <>
              <Typography variant="h6" sx={{ mt: 3 }}>
                Select Account Types to Email:
              </Typography>
              <Box>
                {accountTypeOptions.map((accountType) => (
                  <FormControlLabel
                    key={accountType}
                    control={
                      <Checkbox
                        value={accountType}
                        onChange={handleAccountTypeChange}
                      />
                    }
                    label={accountType}
                  />
                ))}
              </Box>
              </>
              )}

              {(user.accountType === "Admin" ||
                user.accountType === "Staff") && (
                <Button
                  variant="contained"
                  onClick={sendNewsletterViaEmail}
                  disabled={sendingEmail || selectedAccountTypes.length === 0}
                  sx={{ mt: 3 }}
                  startIcon={sendingEmail && <CircularProgress size={20} />}
                >
                  {sendingEmail ? "Sending..." : "Email Newsletter"}
                </Button>
              )}
              <Button
                variant="text"
                onClick={backToList}
                sx={{ mt: 3, color: "#3498db" }}
              >
                Back to Newsletter List
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
