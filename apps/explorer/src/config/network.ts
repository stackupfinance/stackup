import { ethers } from "ethers";
import { Env } from "./env";
import { CurrencySymbols } from ".";

export type Networks = "Polygon";

type NetworksConfig = {
  nativeCurrency: CurrencySymbols;
  currencies: Record<CurrencySymbols, { address: string }>;
};

export const ValidNetworks: Array<Networks> = ["Polygon"];

export const NetworksConfig: Record<Networks, NetworksConfig> = {
  Polygon: {
    nativeCurrency: "MATIC",
    currencies: {
      MATIC: { address: ethers.constants.AddressZero },
      USDC: {
        address:
          Env.NODE_ENV === "production"
            ? "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
            : "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
      },
      ETH: {
        address:
          Env.NODE_ENV === "production"
            ? "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
            : "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
      },
    },
  },
};
