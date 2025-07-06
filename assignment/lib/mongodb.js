import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    let client;
    let db;

    try {
      client = await clientPromise;
      db = client.db("finance-app");
    } catch (connectionError) {
      console.error("MongoDB connection error:", connectionError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get current month's transactions
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    // Use Promise.allSettled for better error handling
    const [transactionsResult, budgetsResult] = await Promise.allSettled([
      db
        .collection("transactions")
        .find({
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        })
        .toArray(),
      db.collection("budgets").find({}).toArray(),
    ]);

    if (transactionsResult.status === "rejected") {
      console.error("Error fetching transactions:", transactionsResult.reason);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    if (budgetsResult.status === "rejected") {
      console.error("Error fetching budgets:", budgetsResult.reason);
      return NextResponse.json(
        { error: "Failed to fetch budgets" },
        { status: 500 }
      );
    }

    const transactions = transactionsResult.value || [];
    const budgets = budgetsResult.value || [];

    // Calculate spending by category with improved error handling
    const spendingByCategory = {};
    transactions.forEach((transaction) => {
      if (!transaction || typeof transaction !== "object") {
        console.warn("Invalid transaction:", transaction);
        return;
      }

      const category = transaction.category || "Other";
      const amount = parseFloat(transaction.amount) || 0;

      if (!spendingByCategory[category]) {
        spendingByCategory[category] = 0;
      }
      spendingByCategory[category] += amount;
    });

    // Calculate total spending with improved error handling
    const totalSpending = transactions.reduce((sum, transaction) => {
      if (!transaction || typeof transaction !== "object") {
        return sum;
      }
      const amount = parseFloat(transaction.amount) || 0;
      return sum + amount;
    }, 0);

    // Calculate total budget with improved error handling
    const totalBudget = budgets.reduce((sum, budget) => {
      if (!budget || typeof budget !== "object") {
        return sum;
      }
      const amount = parseFloat(budget.amount) || 0;
      return sum + amount;
    }, 0);

    // Calculate budget vs spending with improved error handling
    const budgetComparison = {};
    budgets.forEach((budget) => {
      if (!budget || typeof budget !== "object") {
        console.warn("Invalid budget:", budget);
        return;
      }

      const category = budget.category || "Other";
      const budgetAmount = parseFloat(budget.amount) || 0;
      const spentAmount = spendingByCategory[category] || 0;

      budgetComparison[category] = {
        budget: budgetAmount,
        spent: spentAmount,
        remaining: budgetAmount - spentAmount,
        percentage: budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0,
      };
    });

    // Get recent transactions with sorting and error handling
    const recentTransactions = transactions
      .filter((transaction) => transaction && typeof transaction === "object")
      .sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((transaction) => ({
        ...transaction,
        _id:
          transaction._id?.toString() ||
          Math.random().toString(36).substr(2, 9),
        category: transaction.category || "Other",
        description: transaction.description || "No description",
        amount: parseFloat(transaction.amount) || 0,
        date: transaction.date || new Date().toISOString(),
      }));

    return NextResponse.json({
      summary: {
        totalSpending: Math.round(totalSpending * 100) / 100,
        totalBudget: Math.round(totalBudget * 100) / 100,
        remainingBudget: Math.round((totalBudget - totalSpending) * 100) / 100,
        transactionCount: transactions.length,
      },
      spendingByCategory,
      budgetComparison,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
