// pages/mealPlan/index.js

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLatestMealPlan } from "@/utils/mealPlanAPI";
import { getCurrentUser } from "@/utils/api";
import styles from "./MealPlan.module.css";

export default function MealPlanIndex() {
  const [mealPlan, setMealPlan] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch the latest meal plan
  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchUserAndLatestMealPlan() {
      try {
        const userDetails = await getCurrentUser();
        const daycareID = userDetails.locationID;

        const mealPlanData = await getLatestMealPlan(token, daycareID);
        setMealPlan(mealPlanData);
        setMessage("");
      } catch (error) {
        setMessage(error.message || "Error fetching the latest meal plan.");
        setMealPlan(null);
      }
    }
    fetchUserAndLatestMealPlan();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.h1style}>Current Meal Plan</h1>
        {message && <p className={styles.message}>{message}</p>}

        {mealPlan ? (
          <div className={styles.mealPlanDetails}>
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

            <div className={styles.buttonGroup}>
              <Link href={`/mealPlan/${mealPlan.mealPlanID}`}>
                <button className={`${styles.button} ${styles.editButton}`}>
                  Edit Meal Plan
                </button>
              </Link>
              <Link href="/mealPlan/create">
                <button className={`${styles.button} ${styles.createButton}`}>
                  Create New Meal Plan
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <p className={styles.noMealPlan}>No meal plan found.</p>
        )}
      </div>
    </div>
  );
}
