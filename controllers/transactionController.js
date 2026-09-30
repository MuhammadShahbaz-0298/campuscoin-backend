import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";
import { suggestCategory } from "../services/aiCategorizationService.js";

export const listTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = { userId: req.user.id };

  if (req.query.type) filter.type = req.query.type;

  const [data, total] = await Promise.all([
    Transaction.find(filter)
      .populate("categoryId")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    userId: req.user.id,
  });
  res.status(201).json({ success: true, data: transaction });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true },
  ).populate("categoryId");
  res.json({ success: true, data: transaction });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true });
});

export const suggestTransactionCategory = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { category: suggestCategory(req.body.description) },
  });
});

export const getSavingsProgress = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    userId: req.user.id,
  }).select("amount type");

  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    const amount = Number(transaction.amount) || 0;

    if (transaction.type === "income") {
      income += amount;
    }

    if (transaction.type === "expense") {
      expense += amount;
    }
  }

  const savings = Math.max(income - expense, 0);

  res.json({
    success: true,
    data: {
      income,
      expense,
      savings,
    },
  });
});


