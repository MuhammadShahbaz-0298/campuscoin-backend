import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";

export const categoryBreakdown = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    userId: req.user.id,
    type: "expense",
  }).populate("categoryId");
  const totals = transactions.reduce((result, transaction) => {
    const name = transaction.categoryId?.name || "Miscellaneous";
    result[name] = (result[name] || 0) + transaction.amount;
    return result;
  }, {});
  res.json({
    success: true,
    data: Object.entries(totals).map(([name, value]) => ({ name, value })),
  });
});

export const incomeVsExpense = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id });
  const totals = {};
  for (const transaction of transactions) {
    const month = new Date(transaction.date).toLocaleString("en", {
      month: "short",
    });
    totals[month] ||= { month, income: 0, expense: 0 };
    totals[month][transaction.type] += transaction.amount;
  }
  res.json({ success: true, data: Object.values(totals).slice(-6) });
});
