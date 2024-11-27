// src/pages/mealPlan/recent.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  fetchRecentMealPlansByLocation,
  deleteMealPlan,
} from "@/utils/mealPlanAPI";
import { useUser } from "@/components/authenticate";
import { useTheme } from "@/components/ThemeContext"; // Import the theme context
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";

export default function RecentMealPlans() {
  const user = useUser();
  const router = useRouter();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [mealPlanToDelete, setMealPlanToDelete] = useState(null);
  const { colorblindMode } = useTheme(); // Access colorblind mode

  // Define original colors
  const originalColors = {
    buttonPrimary: "#d32f2f",
    durationText: "#1565C0",
    mealTitle: "#FF7043",
    cardBackground: "#f5f5f5",
  };

  // Define colorblind-friendly overrides
  const colorblindOverrides = {
    "red-green": {
      buttonPrimary: "#1976d2",
      durationText: "#1565C0",
      mealTitle: "#FF7043",
    },
    "blue-yellow": {
      buttonPrimary: "#e77f24",
      durationText: "#e77f24",
      mealTitle: "#9147A9",
    },
  };

  // Merge original colors with colorblind overrides
  const colors = {
    ...originalColors,
    ...(colorblindMode !== "none" ? colorblindOverrides[colorblindMode] : {}),
  };

  // Fetch the recent meal plans by location
  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const recentMealPlans = await fetchRecentMealPlansByLocation(
          user.locationID
        );
        setMealPlans(recentMealPlans);
      } catch (error) {
        if (error.message.includes("Unauthorized")) {
          setErrorMessage("Session expired. Redirecting to login...");
          localStorage.removeItem("token");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setErrorMessage(error.message || "Error fetching recent meal plans.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [user, router]);

  const handleDeleteMealPlan = async () => {
    const token = localStorage.getItem("token");

    try {
      await deleteMealPlan(token, mealPlanToDelete);
      setMealPlans(
        mealPlans.filter((plan) => plan.mealPlanID !== mealPlanToDelete)
      );
      setErrorMessage("Meal plan deleted successfully");
    } catch (error) {
      setErrorMessage("Failed to delete meal plan");
      console.error("Error deleting meal plan:", error);
    } finally {
      setConfirmationModalOpen(false);
      setMealPlanToDelete(null);
    }
  };

  const openConfirmationModal = (mealPlanID) => {
    setMealPlanToDelete(mealPlanID);
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
    setMealPlanToDelete(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 2, mb: 4 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: "bold", mb: 3, color: colors.durationText }}
      >
        Recent Meal Plans
      </Typography>

      {errorMessage && (
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="info" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        </Snackbar>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <CircularProgress />
        </Box>
      ) : mealPlans.length ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {mealPlans.map((plan, index) => (
            <Card
              key={index}
              sx={{
                backgroundColor: colors.cardBackground,
                boxShadow: 3,
                borderRadius: 2,
                p: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: colors.durationText }}
                >
                  Meal Plan Duration
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1">
                  <strong>Start Date:</strong> {plan.startDate}
                </Typography>
                <Typography variant="body1">
                  <strong>End Date:</strong> {plan.endDate}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mt={2}>
                  {["Breakfast", "Lunch", "Snack"].map((meal, idx) => (
                    <Box key={idx} textAlign="center" flex={1} p={1}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: colors.mealTitle }}
                      >
                        {meal}
                      </Typography>
                      <Typography variant="body2">
                        {plan[meal.toLowerCase()] || "Not specified"}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Delete Button for Admins */}
                {user.accountType === "Admin" && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: colors.buttonPrimary,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: colors.buttonPrimary,
                        },
                      }}
                      onClick={() => openConfirmationModal(plan.mealPlanID)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" mt={3}>
          <Typography variant="body1" color="textSecondary">
            No recent meal plans found.
          </Typography>
        </Box>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmationModalOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this meal plan? This action cannot be undone."
        onConfirm={handleDeleteMealPlan}
        onCancel={closeConfirmationModal}
      />
    </Container>
  );
}
