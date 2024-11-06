// src/pages/mealPlan/[id].js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { updateMealPlan, getMealPlan } from "../../utils/mealPlanAPI";

export default function EditMealPlanPage() {
  const router = useRouter();
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
    if (!token) {
      setMessage("User is not authenticated");
      return router.push("/login");
    }

    if (id) {
      const fetchMealPlan = async () => {
        try {
          const data = await getMealPlan(token, id);
          const mealPlan = data.mealPlan.mealPlan;
          setMealPlan(mealPlan);
        } catch (error) {
          setMessage("An error occurred while retrieving the meal plan");
        } finally {
          setLoading(false);
        }
      };
      fetchMealPlan();
    }
  }, [id, router]);

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Meal Plan</h1>
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
        <button type="submit">Update Meal Plan</button>
      </form>
    </div>
  );
}
