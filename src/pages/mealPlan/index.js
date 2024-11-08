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
  Grid,
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
    <Container maxWidth="md" sx={{ mt: 4, p: 2, mb: 4 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: "bold", color: "#3A3A3A", mb: 3 }}
      >
        Weekly Meal Plan
      </Typography>

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

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : mealPlan ? (
        <>
          <Box
            sx={{
              backgroundColor: "#E3F2FD",
              borderRadius: 2,
              p: 2,
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1565C0" }}>
              Meal Plan Duration
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              <strong>Start Date:</strong> {mealPlan.startDate}
            </Typography>
            <Typography variant="body1">
              <strong>End Date:</strong> {mealPlan.endDate}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Meal Cards */}
            {["Breakfast", "Lunch", "Snack"].map((meal, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    backgroundColor: "#f5f5f5",
                    boxShadow: 3,
                    borderRadius: 3,
                    p: 2,
                    minHeight: "200px",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#FF7043",
                        fontSize: "1.125rem",
                      }}
                    >
                      {meal}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ mt: 1, color: "#3A3A3A" }}>
                      {mealPlan[meal.toLowerCase()] || "Not specified"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Allergens and Alternatives Section */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "#FFEBEE",
              borderRadius: 2,
              boxShadow: 1,
              textAlign: "center",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#C62828" }}>
                  Allergens
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {mealPlan.allergens || "None specified"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#C62828" }}>
                  Alternatives
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {mealPlan.alternatives || "None available"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            {user && (user.accountType === "Admin" || user.accountType === "Staff") && (
              <Button
                variant="contained"
                color="success"
                component={Link}
                href="/mealPlan/create"
                sx={{
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  px: 3,
                }}
              >
                Create New Meal Plan
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href={`/mealPlan/${mealPlan.mealPlanID}`}
              sx={{
                textTransform: "none",
                fontSize: { xs: "0.875rem", md: "1rem" },
                px: 3,
              }}
            >
              Edit Meal Plan
            </Button>
          </Box>
        </>
      ) : (
        <Box textAlign="center" mt={3}>
          <Typography variant="body1" color="textSecondary">
            No meal plan found.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
