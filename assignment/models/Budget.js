import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
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
    ],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  period: {
    type: String,
    enum: ["monthly", "weekly", "yearly"],
    default: "monthly",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

budgetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure one budget per category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
