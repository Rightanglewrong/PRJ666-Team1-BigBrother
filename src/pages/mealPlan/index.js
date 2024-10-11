// pages/mealPlan/index.js

import jwt from "jsonwebtoken";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getLatestMealPlan } from "../../utils/mealPlanAPI";

export default function MealPlanIndex() {
  const [mealPlan, setMealPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Fetch the latest meal plan
  useEffect(() => {
    const token = localStorage.getItem("token");
    const decodedToken = jwt.decode(token);
    const daycareID = decodedToken.locationID;

    getLatestMealPlan(token, daycareID)
      .then((data) => {
        setMealPlan(data);
        setMessage("");
      })
      .catch((error) => {
        setMessage(error.message || "Error fetching the latest meal plan.");
        setMealPlan(null);
      });
  }, []);

  return (
    <div>
      <h1>Current Meal Plan</h1>
      {message && <p>{message}</p>}

      {mealPlan ? (
        <div>
          <p>
            <strong>Start Date:</strong> {mealPlan.startDate}
          </p>
          <p>
            <strong>End Date:</strong> {mealPlan.endDate}
          </p>
          <p>
            <strong>Breakfast:</strong> {mealPlan.breakfast}
          </p>
          <p>
            <strong>Lunch:</strong> {mealPlan.lunch}
          </p>
          <p>
            <strong>Snack:</strong> {mealPlan.snack}
          </p>
          <p>
            <strong>Allergens:</strong> {mealPlan.allergens}
          </p>
          <p>
            <strong>Alternatives:</strong> {mealPlan.alternatives}
          </p>

          <Link href={`/mealPlan/${mealPlan.mealPlanID}`}>
            <button>Edit Meal Plan</button>
          </Link>
        </div>
      ) : (
        <p>No meal plan found.</p>
      )}

      <Link href="/mealPlan/create">
        <button>Create New Meal Plan</button>
      </Link>
    </div>
  );
}
