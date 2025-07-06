
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
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  CreditCard,
  Wallet,
  Award,
  Settings,
  Plus,
  Edit,
  Save,
  X,
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
  Area,
  AreaChart,
  Line,
  LineChart,
  ComposedChart,
} from "recharts";

const Dashboard = ({ categoryColors = {} }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced category colors with gradients
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

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
      setAnimationKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Initialize budget form with current budgets
  const initializeBudgetForm = () => {
    const form = {};
    if (dashboardData?.budgetComparison) {
      Object.keys(dashboardData.budgetComparison).forEach((category) => {
        form[category] = dashboardData.budgetComparison[category].budget;
      });
    }
    setBudgetForm(form);
  };

  // Handle budget form changes
  const handleBudgetChange = (category, value) => {
    setBudgetForm((prev) => ({
      ...prev,
      [category]: parseFloat(value) || 0,
    }));
  };

  // Add new budget category
  const addBudgetCategory = () => {
    const newCategory = prompt("Enter new category name:");
    if (newCategory && newCategory.trim()) {
      setBudgetForm((prev) => ({
        ...prev,
        [newCategory.trim()]: 0,
      }));
    }
  };

  // Save budgets to API
  const saveBudgets = async () => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budgets: budgetForm }),
      });

      if (!response.ok) {
        throw new Error("Failed to save budgets");
      }

      setShowBudgetModal(false);
      await fetchDashboardData(); // Refresh dashboard data
    } catch (err) {
      console.error("Error saving budgets:", err);
      alert("Failed to save budgets. Please try again.");
    }
  };

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

  const getBudgetVsActualData = () => {
    if (!dashboardData?.budgetComparison) return [];

    return Object.entries(dashboardData.budgetComparison).map(
      ([category, data]) => ({
        category,
        budget: data.budget,
        actual: data.spent,
        difference: data.remaining,
        color: defaultCategoryColors[category] || "#8884d8",
      })
    );
  };

  // Calculate monthly savings rate
  const calculateSavingsRate = () => {
    if (!dashboardData?.summary) return 0;
    const { totalSpending, monthlyIncome } = dashboardData.summary;
    if (!monthlyIncome) return 0;
    return ((monthlyIncome - totalSpending) / monthlyIncome) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            Loading your financial insights...
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 px-8 py-6 rounded-xl shadow-2xl max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <strong className="font-bold text-lg">
                Oops! Something went wrong
              </strong>
              <p className="mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, budgetComparison, recentTransactions } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Financial Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Track your spending and achieve your goals
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Spending */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-red-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {((summary?.totalSpending || 0) / (summary?.totalBudget || 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Spending
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {balanceVisible
                    ? `$${summary?.totalSpending?.toFixed(2) || "0.00"}`
                    : "••••••"}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-blue-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Budget
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {balanceVisible
                    ? `$${summary?.totalBudget?.toFixed(2) || "0.00"}`
                    : "••••••"}
                </p>
                <p className="text-xs text-gray-500">Monthly limit</p>
              </div>
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {(summary?.remainingBudget || 0) >= 0 ? "+" : ""}
                    {(((summary?.remainingBudget || 0) / (summary?.totalBudget || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Remaining Budget
                </p>
                <p className={`text-3xl font-bold mb-2 ${
                  (summary?.remainingBudget || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {balanceVisible
                    ? `$${summary?.remainingBudget?.toFixed(2) || "0.00"}`
                    : "••••••"}
                </p>
                <p className="text-xs text-gray-500">
                  {(summary?.remainingBudget || 0) >= 0 ? "Available to spend" : "Over budget"}
                </p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Budget vs Actual Comparison Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Budget vs Actual Spending
              </h3>
              <p className="text-sm text-gray-600">
                Compare your planned vs actual spending by category
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Budget</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Actual</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={getBudgetVsActualData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                formatter={(value, name) => [
                  `$${value.toFixed(2)}`,
                  name === "budget" ? "Budget" : "Actual",
                ]}
              />
              <Bar dataKey="budget" fill="#3b82f6" name="budget" />
              <Bar dataKey="actual" fill="#ef4444" name="actual" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getBudgetProgressData().map((item, index) => (
            <div
              key={item.category}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                item.status === "over"
                  ? "ring-2 ring-red-200"
                  : item.status === "warning"
                  ? "ring-2 ring-yellow-200"
                  : "ring-2 ring-transparent hover:ring-gray-200"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-white font-bold text-sm">
                      {item.category.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.category}</h4>
                    <p className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}% used
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === "over" && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  {item.status === "warning" && (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                  {item.status === "good" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="font-bold text-gray-900">
                    ${item.spent.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="font-medium text-gray-700">
                    ${item.budget.toFixed(2)}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        item.percentage > 100
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : item.percentage > 80
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                        animationDelay: `${index * 200}ms`,
                      }}
                    />
                  </div>
                  {item.percentage > 100 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {item.remaining > 0 ? "Remaining" : "Over budget"}
                  </span>
                  <span
                    className={`font-semibold ${
                      item.remaining > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${Math.abs(item.remaining).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600">Your latest transactions</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions?.map((transaction, index) => (
              <div
                key={transaction._id}
                className="group flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white/80 rounded-xl transition-all duration-200 hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor:
                        defaultCategoryColors[transaction.category] + "20",
                      border: `2px solid ${
                        defaultCategoryColors[transaction.category]
                      }40`,
                    }}
                  >
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: defaultCategoryColors[transaction.category],
                      }}
                    >
                      {transaction.category.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">
                        {transaction.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    -${transaction.amount.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <Zap className="w-3 h-3 text-yellow-500 mr-1" />
                    <span className="text-xs text-gray-500">Instant</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
  )
}
export default Dashboard;
