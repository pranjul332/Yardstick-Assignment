"use client";
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  X,
  CheckCircle,
} from "lucide-react";

const Transactions = ({ categories, categoryColors }) => {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    description: "",
    category: "Food",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
      errors.amount = "Please enter a valid amount greater than 0";
    }

    if (!formData.date) {
      errors.date = "Please select a date";
    }

    if (!formData.description.trim()) {
      errors.description = "Please enter a description";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description.trim(),
        category: formData.category,
      };

      if (editingTransaction) {
        const response = await fetch(
          `/api/transactions/${editingTransaction._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update transaction");
        }

        setTransactions(
          transactions.map((t) =>
            t._id === editingTransaction._id
              ? { ...transactionData, _id: editingTransaction._id }
              : t
          )
        );
      } else {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
          throw new Error("Failed to create transaction");
        }

        const data = await response.json();
        setTransactions([data.transaction, ...transactions]);
      }

      setFormData({ amount: "", date: "", description: "", category: "Food" });
      setEditingTransaction(null);
      setShowForm(false);
      setFormErrors({});
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      date: transaction.date.split("T")[0],
      description: transaction.description,
      category: transaction.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (transaction) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${transaction._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      setTransactions(transactions.filter((t) => t._id !== transaction._id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setFormData({
      amount: "",
      date: "",
      description: "",
      category: "Food",
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-gray-800 font-medium">Loading transactions...</p>
          <p className="text-gray-500 text-sm">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transactions</h1>
            <p className="text-blue-100 text-lg">
              {transactions.length} total transactions
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 font-medium"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingTransaction
                    ? "Edit Transaction"
                    : "Add New Transaction"}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                        formErrors.amount
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {formErrors.amount && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {formErrors.amount && (
                    <p className="text-red-600 text-sm mt-1 flex items-center animate-in slide-in-from-top-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                      formErrors.date
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {formErrors.date && (
                    <p className="text-red-600 text-sm mt-1 flex items-center animate-in slide-in-from-top-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.date}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="h-4 w-4 mr-2 text-purple-600" />
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                    formErrors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="Enter transaction description"
                />
                {formErrors.description && (
                  <p className="text-red-600 text-sm mt-1 flex items-center animate-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Tag className="h-4 w-4 mr-2 text-orange-600" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        {editingTransaction ? "Update" : "Add"} Transaction
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">All Transactions</h3>
          <p className="text-gray-600 mt-1">Manage your financial records</p>
        </div>

        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first transaction to get started tracking your finances
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 font-medium mx-auto"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Your First Transaction</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction._id}
                  className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 rounded-xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border border-gray-200 hover:border-blue-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{
                          backgroundColor: categoryColors[transaction.category],
                        }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {transaction.description}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                            {transaction.category}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">
                          ${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
