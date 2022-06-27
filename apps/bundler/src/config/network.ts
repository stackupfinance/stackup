import { Env } from "./env";
import { CurrencySymbols } from "./currency";

export type Networks = "Polygon";

type NetworksConfig = {
  currencies: Record<CurrencySymbols, { address: string; priceFeed: string }>;
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
        priceFeed:
          Env.NETWORK_ENV === "mainnet"
            ? "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
            : "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
      },
    },
  },
};
