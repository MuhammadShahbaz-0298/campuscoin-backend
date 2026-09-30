import bcrypt from "bcryptjs";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    academicYear: user.academicYear,
    monthlyAllowanceBaseline: user.monthlyAllowanceBaseline,
    savingsGoal: user.savingsGoal,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });

  if (exists) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
  });

  return res.status(201).json({
    success: true,
    token: generateToken(user),
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const valid =
    user &&
    !user.isDisabled &&
    (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  return res.json({
    success: true,
    token: generateToken(user),
    user: publicUser(user),
  });
});
