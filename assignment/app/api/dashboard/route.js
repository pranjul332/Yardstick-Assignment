import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db("finance-app");

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

    // Calculate spending by category
    const spendingByCategory = {};
    transactions.forEach((transaction) => {
      if (!transaction.category) {
        console.warn("Transaction without category:", transaction);
        return;
      }
      if (!spendingByCategory[transaction.category]) {
        spendingByCategory[transaction.category] = 0;
      }
      spendingByCategory[transaction.category] += transaction.amount || 0;
    });

    // Calculate total spending
    const totalSpending = transactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );

    // Calculate total budget
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + (budget.amount || 0),
      0
    );

    // Calculate budget vs spending
    const budgetComparison = {};
    budgets.forEach((budget) => {
      if (!budget.category) {
        console.warn("Budget without category:", budget);
        return;
      }
      budgetComparison[budget.category] = {
        budget: budget.amount || 0,
        spent: spendingByCategory[budget.category] || 0,
        remaining:
          (budget.amount || 0) - (spendingByCategory[budget.category] || 0),
        percentage: budget.amount
          ? ((spendingByCategory[budget.category] || 0) / budget.amount) * 100
          : 0,
      };
    });

    return NextResponse.json({
      summary: {
        totalSpending,
        totalBudget,
        remainingBudget: totalBudget - totalSpending,
        transactionCount: transactions.length,
      },
      spendingByCategory,
      budgetComparison,
      recentTransactions: transactions.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
