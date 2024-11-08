// src/pages/mealPlan/[id].js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { updateMealPlan, getMealPlan } from "../../utils/mealPlanAPI";
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
  Divider,
} from "@mui/material";

export default function EditMealPlanPage() {
  const router = useRouter();
  const user = useUser();
  const { id } = router.query;
  const [mealPlan, setMealPlan] = useState({
    startDate: "",
    endDate: "",
    breakfast: "",
    lunch: "",
    snack: "",
    allergens: "",
    alternatives: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user) {
      setMessage("User is not authenticated");
      // If the user is not logged in, redirect to login
      // Remove the invalid token if any exists
      localStorage.removeItem("token");
      router.push("/login");
    }

    if (id) {
      const fetchMealPlan = async () => {
        try {
          const data = await getMealPlan(token, id);
          const mealPlan = data.mealPlan.mealPlan;
          setMealPlan(mealPlan);
        } catch (error) {
          if (error.message.includes("Unauthorized")) {
            setMessage("Session expired. Redirecting to login...");
            localStorage.removeItem("token");
            setTimeout(() => {
              router.push("/login");
            }, 2000); // Redirect after 2 seconds for message display
          } else {
            setMessage("An error occurred while retrieving the meal plan");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchMealPlan();
    }
  }, [id, router, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMealPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return;
    }

    try {
      await updateMealPlan(token, id, mealPlan);
      setMessage("Meal Plan updated successfully");
      router.push("/mealPlan");
    } catch (error) {
      setMessage(`Error occurred while updating the meal plan: ${error}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, p: 3, backgroundColor: "#FFFAF0", borderRadius: 2, boxShadow: 3, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2c3e50", fontWeight: "bold" }}>
        Edit Meal Plan
      </Typography>

      {message && (
        <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity="info" onClose={() => setMessage("")}>
            {message}
          </Alert>
        </Snackbar>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Date Fields */}
        <Typography variant="h6" sx={{ color: "#3498db", fontWeight: "bold" }}>Duration</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField label="Start Date" type="date" name="startDate" value={mealPlan.startDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />
          <TextField label="End Date" type="date" name="endDate" value={mealPlan.endDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Meal Fields */}
        <Typography variant="h6" sx={{ color: "#3498db", fontWeight: "bold" }}>Meals</Typography>
        <TextField label="Breakfast" name="breakfast" value={mealPlan.breakfast} onChange={handleInputChange} required multiline rows={2} sx={{ backgroundColor: "#f5f5f5" }} />
        <TextField label="Lunch" name="lunch" value={mealPlan.lunch} onChange={handleInputChange} required multiline rows={2} sx={{ backgroundColor: "#f5f5f5" }} />
        <TextField label="Snack" name="snack" value={mealPlan.snack} onChange={handleInputChange} required multiline rows={2} sx={{ backgroundColor: "#f5f5f5" }} />

        <Divider sx={{ my: 2 }} />

        {/* Allergens and Alternatives Fields */}
        <Typography variant="h6" sx={{ color: "#3498db", fontWeight: "bold" }}>Additional Info</Typography>
        <TextField label="Allergens" name="allergens" value={mealPlan.allergens} onChange={handleInputChange} variant="outlined" />
        <TextField label="Alternatives" name="alternatives" value={mealPlan.alternatives} onChange={handleInputChange} variant="outlined" />

        {/* Submit Button */}
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
          Update Meal Plan
        </Button>
      </Box>
    </Container>
  );
}
