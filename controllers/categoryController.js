import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (req, res) => {
  const filter = { $or: [{ isDefault: true }, { userId: req.user.id }] };

  if (!req.query.page) {
    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    return res.json({ success: true, data: categories });
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const [data, total] = await Promise.all([
    Category.find(filter)
      .sort({ type: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Category.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    userId: req.user.id,
    isDefault: false,
  });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true },
  );
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true });
});
