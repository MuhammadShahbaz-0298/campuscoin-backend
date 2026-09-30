import bcrypt from "bcryptjs";
import connectDatabase from "./config/db.js";
import User from "./models/User.js";
import Category from "./models/Category.js";

const defaults = [
  ["Allowance", "income"],
  ["Part-time Job", "income"],
  ["Scholarship", "income"],
  ["Gift", "income"],
  ["Other Income", "income"],
  ["Food", "expense"],
  ["Transport", "expense"],
  ["Hostel/Rent", "expense"],
  ["Academics", "expense"],
  ["Subscriptions", "expense"],
  ["Entertainment", "expense"],
  ["Miscellaneous", "expense"],
];

await connectDatabase();
await Category.deleteMany({});
await Category.insertMany(
  defaults.map(([name, type]) => ({ name, type, isDefault: true })),
);
await User.updateOne(
  { email: "demo@campuscoin.app" },
  {
    $setOnInsert: {
      name: "Demo Student",
      email: "demo@campuscoin.app",
      passwordHash: await bcrypt.hash("Demo123!", 10),
    },
  },
  { upsert: true },
);
await User.updateOne(
  { email: "admin@campuscoin.app" },
  {
    $setOnInsert: {
      name: "Campus Admin",
      email: "admin@campuscoin.app",
      passwordHash: await bcrypt.hash("Admin123!", 10),
      role: "admin",
    },
  },
  { upsert: true },
);
console.log("Seed complete");
process.exit(0);
