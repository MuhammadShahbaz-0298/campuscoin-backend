import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    academicYear: { type: String, default: "" },
    monthlyAllowanceBaseline: { type: Number, default: 0 },
    savingsGoal: { type: Number, default: 0 },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isDisabled: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpires: Date,
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
