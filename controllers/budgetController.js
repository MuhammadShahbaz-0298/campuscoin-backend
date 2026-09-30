import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";

async function addProgress(data, userId) {
  const totals = await Transaction.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense" },
    },
    {
      $group: {
        _id: {
          categoryId: "$categoryId",
          month: { $dateToString: { format: "%Y-%m", date: "$date" } },
        },
        spent: { $sum: "$amount" },
      },
    },
  ]);
  const lookup = Object.fromEntries(
    totals.map((item) => [
      `${item._id.categoryId}:${item._id.month}`,
      item.spent,
    ]),
  );
  return data.map((budget) => {
    console.log(budget.limitAmount);
    const key = `${budget.categoryId?._id}:${budget.month}`;
    const spent = lookup[key] || 0;
    const percentage = budget.limitAmount
      ? Math.min(100, Math.round((spent / budget.limitAmount) * 100))
      : 0;
    return { ...budget.toObject(), spent, percentage };
  });
}

export const listBudgets = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = { userId: req.user.id };
  if (req.query.month) filter.month = req.query.month;
  const [rows, total] = await Promise.all([
    Budget.find(filter)
      .populate("categoryId")
      .sort({ month: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Budget.countDocuments(filter),
  ]);
  const data = await addProgress(rows, req.user.id);
  res.json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const upsertBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    {
      userId: req.user.id,
      categoryId: req.body.categoryId,
      month: req.body.month,
    },
    { ...req.body, userId: req.user.id },
    { upsert: true, new: true },
  ).populate("categoryId");
  const [withProgress] = await addProgress([budget], req.user.id);
  res.status(201).json({ success: true, data: withProgress });
});
