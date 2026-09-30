import User from "../models/User.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const [users, transactions, categories] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Transaction.countDocuments(),
    Category.countDocuments(),
  ]);
  res.json({ success: true, data: { users, transactions, categories } });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "student" }).select(
    "-passwordHash -resetToken -resetTokenExpires",
  );
  res.json({ success: true, data: users });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).select("-passwordHash -resetToken -resetTokenExpires");
  res.json({ success: true, data: user });
});

export const listDefaultCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isDefault: true }).sort({
    type: 1,
    name: 1,
  });
  res.json({ success: true, data: categories });
});

export const updateDefaultCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, isDefault: true },
    req.body,
    { new: true },
  );
  res.json({ success: true, data: category });
});
