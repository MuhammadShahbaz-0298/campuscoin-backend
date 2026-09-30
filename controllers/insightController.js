import Insight from "../models/Insight.js";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";
import { monthBounds, shiftMonth } from "../utils/monthRange.js";
import { generateMonthlyInsight } from "../services/insightGeneratorService.js";

export const listInsights = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = { userId: req.user.id };
  const [data, total] = await Promise.all([
    Insight.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Insight.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const generateInsight = asyncHandler(async (req, res) => {
  const month = req.body.month || new Date().toISOString().slice(0, 7);
  const range = monthBounds(month);
  const previousRange = monthBounds(shiftMonth(month, -1));

  const [transactions, previousTransactions, budgets] = await Promise.all([
    Transaction.find({
      userId: req.user.id,
      date: { $gte: range.start, $lt: range.end },
    }).populate("categoryId"),
    Transaction.find({
      userId: req.user.id,
      date: { $gte: previousRange.start, $lt: previousRange.end },
    }).populate("categoryId"),
    Budget.find({ userId: req.user.id, month }).populate("categoryId"),
  ]);

  const generated = generateMonthlyInsight(transactions, month, {
    previousTransactions,
    budgets,
  });

  const insight = await Insight.create({
    userId: req.user.id,
    month,
    ...generated,
  });
  res.status(201).json({ success: true, data: insight });
});

export const bookmarkInsight = asyncHandler(async (req, res) => {
  const insight = await Insight.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isBookmarked: req.body.isBookmarked },
    { new: true },
  );
  res.json({ success: true, data: insight });
});

export const clearAllInsights = asyncHandler(async (req, res) => {
  await Insight.deleteMany({ userId: req.user.id });

  res.json({
    success: true,
    message: "All insights deleted successfully.",
  });
});

