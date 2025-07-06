"use client";
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

const Dashboard = ({ categoryColors = {} }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Default category colors
  const defaultCategoryColors = {
    Food: "#FF6B6B",
    Transportation: "#4ECDC4",
    Entertainment: "#45B7D1",
    Shopping: "#96CEB4",
    Health: "#FFEAA7",
    Bills: "#DDA0DD",
    Other: "#98D8C8",
    ...categoryColors,
  };

  // Data processing functions
  const getBudgetProgressData = () => {
    if (!dashboardData?.budgetComparison) return [];

    return Object.entries(dashboardData.budgetComparison).map(
      ([category, data]) => ({
        category,
        budget: data.budget,
        spent: data.spent,
        remaining: data.remaining,
        percentage: data.percentage,
        color: defaultCategoryColors[category] || "#8884d8",
        status:
          data.percentage > 100
            ? "over"
            : data.percentage > 80
            ? "warning"
            : "good",
      })
    );
  };

  const getSpendingData = () => {
    if (!dashboardData?.spendingByCategory) return [];

    return Object.entries(dashboardData.spendingByCategory).map(
      ([category, amount]) => ({
        category,
        amount,
        color: defaultCategoryColors[category] || "#8884d8",
      })
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  const { summary, budgetComparison, recentTransactions } = dashboardData || {};

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Spending
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary?.totalSpending?.toFixed(2) || "0.00"}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary?.totalBudget?.toFixed(2) || "0.00"}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Remaining Budget
              </p>
              <p
                className={`text-2xl font-bold ${
                  (summary?.remainingBudget || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${summary?.remainingBudget?.toFixed(2) || "0.00"}
              </p>
            </div>
            <TrendingUp
              className={`h-8 w-8 ${
                (summary?.remainingBudget || 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.transactionCount || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Budget Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getBudgetProgressData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `$${value.toFixed(2)}`,
                  name === "spent" ? "Spent" : "Budget",
                ]}
              />
              <Bar dataKey="budget" fill="#E5E7EB" name="budget" />
              <Bar dataKey="spent" fill="#3B82F6" name="spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Spending Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={getSpendingData()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                label={({ category, amount }) =>
                  `${category}: $${amount.toFixed(2)}`
                }
              >
                {getSpendingData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, "Amount"]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getBudgetProgressData().map((item) => (
          <div
            key={item.category}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{item.category}</h4>
              {item.status === "over" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              {item.status === "warning" && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              {item.status === "good" && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: ${item.spent.toFixed(2)}</span>
                <span>Budget: ${item.budget.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.percentage > 100
                      ? "bg-red-500"
                      : item.percentage > 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {item.percentage.toFixed(1)}% used
                {item.remaining > 0 && (
                  <span className="text-green-600">
                    {" "}
                    • ${item.remaining.toFixed(2)} remaining
                  </span>
                )}
                {item.remaining < 0 && (
                  <span className="text-red-600">
                    {" "}
                    • ${Math.abs(item.remaining).toFixed(2)} over budget
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {recentTransactions?.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      defaultCategoryColors[transaction.category] || "#8884d8",
                  }}
                />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {transaction.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${transaction.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
