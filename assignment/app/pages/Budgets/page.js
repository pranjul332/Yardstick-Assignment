"use client";
import React, { useEffect, useState } from "react";
import { Target } from "lucide-react";

const Budgets = ({
  transactions,
  budgets,
  setBudgets,
  categories,
  categoryColors,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch budgets from backend on component mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/budgets");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBudgets(data.budgets || {});
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveBudgetToBackend = async (category, amount) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount) || 1000,
          period: "monthly",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving budget:", error);
      throw error;
    }
  };

  const handleBudgetChange = async (category, amount) => {
    const numericAmount = parseFloat(amount) || 1000;

    // Update local state immediately for responsive UI
    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [category]: numericAmount,
    }));

    // Save to backend
    try {
      await saveBudgetToBackend(category, numericAmount);
    } catch (error) {
      // Revert local state if backend save fails
      setBudgets((prevBudgets) => ({
        ...prevBudgets,
        [category]: budgets[category] || 1000,
      }));
      setError(`Failed to save budget for ${category}. Please try again.`);
    }
  };

  const getBudgetComparison = () => {
    const categoryExpenses = {};

    // Only count expense transactions for budget comparison
    transactions.forEach((transaction) => {
      // Only include expenses (not income) in budget calculations
      if (transaction.type === "expense" || !transaction.type) {
        categoryExpenses[transaction.category] =
          (categoryExpenses[transaction.category] || 0) + transaction.amount;
      }
    });

    return categories.map((category) => ({
      category,
      budget: budgets[category] || 0,
      actual: categoryExpenses[category] || 0,
      percentage: budgets[category]
        ? ((categoryExpenses[category] || 0) / budgets[category]) * 100
        : 0,
    }));
  };

  const getCategoryData = () => {
    const categoryData = {};

    // Only count expense transactions for spending insights
    transactions.forEach((transaction) => {
      if (transaction.type === "expense" || !transaction.type) {
        categoryData[transaction.category] =
          (categoryData[transaction.category] || 0) + transaction.amount;
      }
    });

    return Object.entries(categoryData).map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Management</h2>
        {loading && (
          <div className="text-sm text-gray-600">Loading budgets...</div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchBudgets();
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* Budget Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Set Monthly Budgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[category] }}
                />
                <span className="font-medium">{category}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">$</span>
                <input
                  type="number"
                  value={budgets[category] || ""}
                  onChange={(e) => handleBudgetChange(category, e.target.value)}
                  className="w-20 p-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
