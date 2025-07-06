"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, Wallet, PieChart, Settings } from "lucide-react";

const Budgets = ({
  transactions,
  budgets,
  setBudgets,
  categories,
  categoryColors,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(true);

  // Fetch budgets from backend on component mount
  const fetchBudgets = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

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

  const budgetComparison = getBudgetComparison();
  const totalBudget = Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
  const totalSpent = budgetComparison.reduce((sum, item) => sum + item.actual, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getStatusColor = (percentage) => {
    if (percentage <= 50) return "text-emerald-600";
    if (percentage <= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (percentage) => {
    if (percentage <= 50) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (percentage <= 80) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <TrendingUp className="w-5 h-5 text-red-600" />;
  };

  const getProgressBarColor = (percentage) => {
    if (percentage <= 50) return "bg-emerald-500";
    if (percentage <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Budget Management
              </h1>
              <p className="text-gray-600 mt-1">Track and manage your spending goals</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Syncing...</span>
              </div>
            )}
            
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Something went wrong</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchBudgets();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <PieChart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Budget Used</p>
                <p className={`text-2xl font-bold ${getStatusColor(totalPercentage)}`}>
                  {totalPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        

        {/* Budget Settings */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Budget Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category}
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200 hover:from-blue-50 hover:to-indigo-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: categoryColors[category] }}
                      />
                      <span className="font-semibold text-gray-900">{category}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      $
                    </div>
                    <input
                      type="number"
                      value={budgets[category] || ""}
                      onChange={(e) => handleBudgetChange(category, e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-center font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder="1000"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500 font-medium">Monthly Budget</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;