import dotenv from "dotenv";

dotenv.config();

export interface AppEnvironment {
  NODE_ENV: "production" | "development";
  NETWORK_ENV: "mainnet" | "testnet";
  NAME: string;
  PORT: number;
  SENTRY_DSN: string;
}

export const Env: AppEnvironment = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ? "production" : "development",
  NETWORK_ENV:
    process.env.STACKUP_PAYMENTS_NETWORK_ENV === "mainnet"
      ? "mainnet"
      : "testnet",
  NAME: "Explorer",
  PORT: Number(process.env.STACKUP_PAYMENTS_PORT),
  SENTRY_DSN: process.env.STACKUP_PAYMENTS_SENTRY_DSN ?? "",
};
