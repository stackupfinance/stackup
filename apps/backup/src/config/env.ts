import dotenv from "dotenv";

dotenv.config();

interface AppEnvironment {
  NODE_ENV: "production" | "development";
  NAME: string;
  PORT: number;
  MONGO_URL: string;
  SENTRY_DSN: string;
  ALCHEMY_POLYGON_RPC: string;
}

export const Env: AppEnvironment = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ? "production" : "development",
  NAME: "Backup",
  PORT: Number(process.env.STACKUP_BACKUP_PORT),
  MONGO_URL: process.env.STACKUP_BACKUP_MONGODB_URL ?? "",
  SENTRY_DSN: process.env.STACKUP_BACKUP_SENTRY_DSN ?? "",
  ALCHEMY_POLYGON_RPC: process.env.STACKUP_BACKUP_ALCHEMY_POLYGON_RPC ?? "",
};
