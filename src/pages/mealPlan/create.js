// src/pages/mealPlan/create.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createMealPlan } from "../../utils/mealPlanAPI";
import { getCurrentUser } from "@/utils/api";

export default function CreateMealPlanPage() {
  const router = useRouter();
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
  const [userDetails, setUserDetails] = useState(
    useState({ daycareID: "", firstName: "", lastName: "" })
  );

  // Get the daycareID from the JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return router.push("/login");
    }

    async function fetchProfile() {
      try {
        const userDetails = await getCurrentUser();
        setUserDetails({
          daycareID: userDetails.locationID,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
        });
      } catch (error) {
        setMessage(error.message);
        setMealPlan(null);
      }
    }
    fetchProfile();
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

    // Include daycareID and createdBy in the meal plan object
    let daycareID = userDetails.daycareID;
    let fName = userDetails.firstName;
    let lName = userDetails.lastName;
    let createdBy = `${fName} ${lName}`;
    const mealPlanData = { ...mealPlan, createdBy, daycareID };

    try {
      await createMealPlan(token, mealPlanData);
      setMessage("Meal Plan created successfully");
      router.push("/mealPlan"); // Redirect to meal plan overview after creation
    } catch (error) {
      if (error.message.includes("403")) {
        setMessage("You do not have permission to create a meal plan.");
      } else {
        setMessage("An error occurred while creating the meal plan");
      }
    }
  };

  return (
    <div>
      <h1>Create Meal Plan</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={mealPlan.startDate}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={mealPlan.endDate}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Breakfast:
          <input
            type="text"
            name="breakfast"
            value={mealPlan.breakfast}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Lunch:
          <input
            type="text"
            name="lunch"
            value={mealPlan.lunch}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Snack:
          <input
            type="text"
            name="snack"
            value={mealPlan.snack}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Allergens:
          <input
            type="text"
            name="allergens"
            value={mealPlan.allergens}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Alternatives:
          <input
            type="text"
            name="alternatives"
            value={mealPlan.alternatives}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Create Meal Plan</button>
      </form>
    </div>
  );
}
