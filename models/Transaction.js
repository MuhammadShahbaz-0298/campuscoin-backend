import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true },
    description: { type: String, trim: true, default: "" },
    aiSuggestedCategory: { type: String, default: "" },
    isRecurring: { type: Boolean, default: false },
    recurrenceInterval: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);
