import { Env } from "./env";
import { CurrencySymbols } from "./currency";

export type Networks = "Polygon";

type NetworksConfig = {
  currencies: Record<CurrencySymbols, { address: string }>;
};

export const ValidNetworks: Array<Networks> = ["Polygon"];

export const NetworksConfig: Record<Networks, NetworksConfig> = {
  Polygon: {
    currencies: {
      USDC: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
            : "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
      },
    },
  },
};
