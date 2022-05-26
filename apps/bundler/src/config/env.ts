import dotenv from "dotenv";

dotenv.config();

interface AppEnvironment {
  NODE_ENV: "production" | "development";
  NAME: string;
  PORT: number;
  MONGO_URL: string;
  SENTRY_DSN: string;
}

export const Env: AppEnvironment = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ? "production" : "development",
  NAME: "Bundler",
  PORT: Number(process.env.STACKUP_BUNDLER_PORT),
  MONGO_URL: process.env.STACKUP_BUNDLER_MONGODB_URL ?? "",
  SENTRY_DSN: process.env.STACKUP_BUNDLER_SENTRY_DNS ?? "",
};
