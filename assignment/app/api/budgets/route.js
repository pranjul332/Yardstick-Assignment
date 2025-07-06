import { NextResponse } from "next/server";

// Import MongoDB client
let clientPromise;
try {
  // Use dynamic import to prevent build-time issues
  if (typeof window === "undefined") {
    // Only import on server-side
    clientPromise = import("@/lib/mongodb").then((module) => module.default);
  }
} catch (error) {
  console.error("MongoDB import error:", error);
  clientPromise = null;
}

export async function GET(request) {
  try {
    if (!clientPromise) {
      throw new Error("MongoDB connection not available");
    }

    const client = await clientPromise;
    const db = client.db("finance-app");

    const budgets = await db.collection("budgets").find({}).toArray();

    // Convert to object format for easier frontend consumption
    const budgetMap = {};
    budgets.forEach((budget) => {
      budgetMap[budget.category] = budget.amount;
    });

    return NextResponse.json({ budgets: budgetMap });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!clientPromise) {
      throw new Error("MongoDB connection not available");
    }

    const client = await clientPromise;
    const db = client.db("finance-app");

    const body = await request.json();
    const { category, amount, period = "monthly" } = body;

    // Validation
    if (!category || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const budget = {
      category,
      amount: parseFloat(amount),
      period,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use upsert to update existing budget or create new one
    const result = await db
      .collection("budgets")
      .replaceOne({ category }, budget, { upsert: true });

    return NextResponse.json({
      message: "Budget saved successfully",
      budget,
    });
  } catch (error) {
    console.error("Error saving budget:", error);
    return NextResponse.json(
      { error: "Failed to save budget" },
      { status: 500 }
    );
  }
}
