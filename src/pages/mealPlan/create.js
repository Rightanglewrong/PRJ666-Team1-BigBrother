// src/pages/mealPlan/create.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createMealPlan } from "../../utils/mealPlanAPI";
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

export default function CreateMealPlanPage() {
  const router = useRouter();
  const user = useUser();
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);
  const [mealPlan, setMealPlan] = useState({
    startDate: today.toISOString().split("T")[0],
    endDate: nextMonth.toISOString().split("T")[0],
    breakfast: "",
    lunch: "",
    snack: "",
    allergens: "",
    alternatives: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMessage("User is not authenticated");
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMealPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return router.push("/login");
    }

    let daycareID = user.locationID;
    let fName = user.firstName;
    let lName = user.lastName;
    let createdBy = `${fName} ${lName}`;
    const mealPlanData = { ...mealPlan, createdBy, daycareID };

    try {
      await createMealPlan(token, mealPlanData);
      setMessage("Meal Plan created successfully");
      router.push("/mealPlan");
    } catch (error) {
      setMessage("An error occurred while creating the meal plan: " + error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, p: 3, backgroundColor: "#FFFAF0", borderRadius: 2, boxShadow: 3, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2c3e50", fontWeight: "bold" }}>
        Create Meal Plan
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Create Meal Plan"}
        </Button>
      </Box>
    </Container>
  );
}