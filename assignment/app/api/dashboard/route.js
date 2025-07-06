import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
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

    const transactions = await db
      .collection("transactions")
      .find({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .toArray();

    const budgets = await db.collection("budgets").find({}).toArray();

    // Calculate spending by category
    const spendingByCategory = {};
    transactions.forEach((transaction) => {
      if (!spendingByCategory[transaction.category]) {
        spendingByCategory[transaction.category] = 0;
      }
      spendingByCategory[transaction.category] += transaction.amount;
    });

    // Calculate total spending
    const totalSpending = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Calculate total budget
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

    // Calculate budget vs spending
    const budgetComparison = {};
    budgets.forEach((budget) => {
      budgetComparison[budget.category] = {
        budget: budget.amount,
        spent: spendingByCategory[budget.category] || 0,
        remaining: budget.amount - (spendingByCategory[budget.category] || 0),
        percentage:
          ((spendingByCategory[budget.category] || 0) / budget.amount) * 100,
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
