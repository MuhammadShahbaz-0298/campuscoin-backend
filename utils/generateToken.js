import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export default function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: "7d" },
  );
}
