// pages/mealPlan/index.js

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLatestMealPlan } from "@/utils/mealPlanAPI";
import { useUser } from "@/components/authenticate";
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

export default function MealPlanIndex() {
  const user = useUser();
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch the latest meal plan
  useEffect(() => {
    const fetchLatestMealPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Unauthorized - please log in again.");
        }

        const mealPlanData = await getLatestMealPlan(token, user.locationID);
        setMealPlan(mealPlanData);
        setMessage("");
      } catch (error) {
        if (error.message.includes("Unauthorized")) {
          setMessage("Session expired. Redirecting to login...");
          localStorage.removeItem("token");
          setTimeout(() => {
            router.push("/login");
          }, 2000); // Redirect after 2 seconds for message display
        } else {
          setMessage(error.message || "Error fetching the latest meal plan.");
        }
        setMealPlan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestMealPlan();
  }, [user, router]);

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
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#2c3e50", fontWeight: "bold" }}
      >
        Current Meal Plan
      </Typography>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {message && (
            <Snackbar
              open={Boolean(message)}
              autoHideDuration={6000}
              onClose={() => setMessage("")}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="info" onClose={() => setMessage("")}>
                {message}
              </Alert>
            </Snackbar>
          )}

          {mealPlan ? (
            <Card
              variant="outlined"
              sx={{ backgroundColor: "#fafafa", boxShadow: 1 }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Latest Meal Plan
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1">
                  <strong>Start Date:</strong> {mealPlan.startDate}
                </Typography>
                <Typography variant="body1">
                  <strong>End Date:</strong> {mealPlan.endDate}
                </Typography>
                <Typography variant="body1">
                  <strong>Breakfast:</strong> {mealPlan.breakfast}
                </Typography>
                <Typography variant="body1">
                  <strong>Lunch:</strong> {mealPlan.lunch}
                </Typography>
                <Typography variant="body1">
                  <strong>Snack:</strong> {mealPlan.snack}
                </Typography>
                <Typography variant="body1">
                  <strong>Allergens:</strong> {mealPlan.allergens}
                </Typography>
                <Typography variant="body1">
                  <strong>Alternatives:</strong> {mealPlan.alternatives}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Edit Meal Plan Button - Aligned to Left */}
                <Box display="flex" justifyContent="flex-start" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    href={`/mealPlan/${mealPlan.mealPlanID}`}
                    sx={{ textTransform: "none" }}
                  >
                    Edit Meal Plan
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box textAlign="center" mt={3}>
              <Typography variant="body1" color="textSecondary">
                No meal plan found.
              </Typography>
            </Box>
          )}

          {/* Centered "Create New Meal Plan" Button Outside Card */}
          {(user.accountType === "Admin" || user.accountType === "Staff") && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="success"
                component={Link}
                href="/mealPlan/create"
                sx={{ textTransform: "none" }}
              >
                Create New Meal Plan
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
