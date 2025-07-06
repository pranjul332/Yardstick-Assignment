import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("finance-app");

    const transactions = await db
      .collection("transactions")
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("finance-app");

    const body = await request.json();
    const { amount, description, category, date, type = "expense" } = body;

    // Validation
    if (!amount || !description || !category || !date) {
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

    // Validate transaction type
    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be either 'income' or 'expense'" },
        { status: 400 }
      );
    }

    const transaction = {
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      type, // Add transaction type
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("transactions").insertOne(transaction);

    return NextResponse.json({
      message: "Transaction created successfully",
      transaction: { ...transaction, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
