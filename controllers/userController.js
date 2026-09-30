import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-passwordHash -resetToken -resetTokenExpires",
  );
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "academicYear",
    "monthlyAllowanceBaseline",
    "savingsGoal",
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  }).select("-passwordHash");
  res.json({ success: true, data: user });
});
