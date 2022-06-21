import dotenv from "dotenv";

dotenv.config();

interface AppEnvironment {
  NODE_ENV: "production" | "development";
  NETWORK_ENV: "mainnet" | "testnet";
  NAME: string;
  PORT: number;
  MONGO_URL: string;
  SENTRY_DSN: string;
  ALCHEMY_POLYGON_RPC: string;
}

export const Env: AppEnvironment = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ? "production" : "development",
  NETWORK_ENV:
    process.env.STACKUP_EXPLORER_NETWORK_ENV === "mainnet"
      ? "mainnet"
      : "testnet",
  NAME: "Bundler",
  PORT: Number(process.env.STACKUP_BUNDLER_PORT),
  MONGO_URL: process.env.STACKUP_BUNDLER_MONGODB_URL ?? "",
  SENTRY_DSN: process.env.STACKUP_BUNDLER_SENTRY_DNS ?? "",
  ALCHEMY_POLYGON_RPC: process.env.STACKUP_BUNDLER_ALCHEMY_POLYGON_RPC ?? "",
};
