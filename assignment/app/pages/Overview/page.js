"use client";
import React, { useState, useEffect } from "react";
import Dashboard from "../Dashboard/page";
import Transactions from "../Transactions/page";
import Budgets from "../Budgets/page";

const FinanceVisualizer = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [currentView, setCurrentView] = useState("dashboard");

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Bills",
    "Shopping",
    "Health",
    "Education",
    "Travel",
    "Savings",
    "Other",
  ];

  const categoryColors = {
    Food: "#FF6B6B",
    Transportation: "#4ECDC4",
    Entertainment: "#45B7D1",
    Bills: "#FFA07A",
    Shopping: "#98D8C8",
    Health: "#F7DC6F",
    Education: "#BB8FCE",
    Travel: "#85C1E9",
    Savings: "#82E0AA",
    Other: "#D5DBDB",
  };

  // Initialize with sample data
  useEffect(() => {
    const sampleTransactions = [
      {
        id: 1,
        amount: 50.0,
        date: "2024-07-01",
        description: "Grocery shopping",
        category: "Food",
      },
      {
        id: 2,
        amount: 25.0,
        date: "2024-07-02",
        description: "Coffee",
        category: "Food",
      },
      {
        id: 3,
        amount: 100.0,
        date: "2024-07-03",
        description: "Gas",
        category: "Transportation",
      },
      {
        id: 4,
        amount: 75.0,
        date: "2024-07-04",
        description: "Movie night",
        category: "Entertainment",
      },
      {
        id: 5,
        amount: 200.0,
        date: "2024-07-05",
        description: "Electricity bill",
        category: "Bills",
      },
    ];

    const sampleBudgets = {
      Food: 300,
      Transportation: 200,
      Entertainment: 150,
      Bills: 400,
      Shopping: 250,
      Health: 100,
      Education: 200,
      Travel: 300,
      Savings: 500,
      Other: 100,
    };

    setTransactions(sampleTransactions);
    setBudgets(sampleBudgets);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            transactions={transactions}
            categoryColors={categoryColors}
          />
        );
      case "transactions":
        return (
          <Transactions
            transactions={transactions}
            setTransactions={setTransactions}
            categories={categories}
            categoryColors={categoryColors}
          />
        );
      case "budgets":
        return (
          <Budgets
            transactions={transactions}
            budgets={budgets}
            setBudgets={setBudgets}
            categories={categories}
            categoryColors={categoryColors}
          />
        );
      default:
        return (
          <Dashboard
            transactions={transactions}
            categoryColors={categoryColors}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="text-2xl font-bold text-gray-900">
              Personal Finance Visualizer
            </a>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "dashboard"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("transactions")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "transactions"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setCurrentView("budgets")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "budgets"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Budgets
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default FinanceVisualizer;
