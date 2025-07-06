import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// Create a new client with proper options
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // Remove any invalid options like buffermaxentries
});

export async function GET() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("finance-app");

    // Get collections
    const transactionsCollection = db.collection("transactions");
    const budgetsCollection = db.collection("budgets");

    // Fetch recent transactions
    const recentTransactions = await transactionsCollection
      .find({})
      .sort({ date: -1 })
      .limit(10)
      .toArray();

    // Fetch budgets
    const budgets = await budgetsCollection.find({}).toArray();

    // Calculate spending by category
    const spendingByCategory = {};
    const categoryTotals = {};

    for (const transaction of recentTransactions) {
      const category = transaction.category || "Other";
      spendingByCategory[category] =
        (spendingByCategory[category] || 0) + transaction.amount;
    }

    // Calculate budget comparison
    const budgetComparison = {};
    let totalBudget = 0;
    let totalSpending = 0;

    for (const budget of budgets) {
      const category = budget.category;
      const budgetAmount = budget.amount;
      const spent = spendingByCategory[category] || 0;

      totalBudget += budgetAmount;
      totalSpending += spent;

      budgetComparison[category] = {
        budget: budgetAmount,
        spent: spent,
        remaining: budgetAmount - spent,
        percentage: (spent / budgetAmount) * 100,
      };
    }

    // Calculate summary
    const summary = {
      totalSpending,
      totalBudget,
      remainingBudget: totalBudget - totalSpending,
      monthlyIncome: 5000, // You might want to fetch this from another collection
    };

    const dashboardData = {
      summary,
      spendingByCategory,
      budgetComparison,
      recentTransactions,
    };

    return Response.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  } finally {
    // Close the connection
    await client.close();
  }
}

export async function POST(request) {
  try {
    const { budgets } = await request.json();

    await client.connect();
    const db = client.db("finance-app");
    const budgetsCollection = db.collection("budgets");

    // Update budgets
    const bulkOps = Object.entries(budgets).map(([category, amount]) => ({
      updateOne: {
        filter: { category },
        update: { $set: { category, amount } },
        upsert: true,
      },
    }));

    await budgetsCollection.bulkWrite(bulkOps);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Budget Update Error:", error);
    return Response.json(
      { error: "Failed to update budgets" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
