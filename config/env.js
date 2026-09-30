import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} is required in server/.env`);
  }
}

export const env = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  port: Number(process.env.PORT || 5000),
};
