import { ethers, BigNumberish } from "ethers";
import { Token, WETH9 } from "@uniswap/sdk-core";
import { AppEnvironment, Env } from "./env";
import { CurrencySymbols, CurrencyMeta } from ".";

export type Networks = "Polygon";

type NetworksConfig = {
  nativeCurrency: CurrencySymbols;
  wrappedNativeCurrency: (networkEnv?: AppEnvironment["NETWORK_ENV"]) => string;
  chainId: (networkEnv?: AppEnvironment["NETWORK_ENV"]) => BigNumberish;
  uniswapV3Router: string;
  currencies: Record<CurrencySymbols, { address: string }>;
};

export const ValidNetworks: Array<Networks> = ["Polygon"];

export const NetworksConfig: Record<Networks, NetworksConfig> = {
  Polygon: {
    nativeCurrency: "MATIC",
    wrappedNativeCurrency: (networkEnv = Env.NETWORK_ENV) =>
      networkEnv === "mainnet"
        ? "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
        : "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    chainId: (networkEnv = Env.NETWORK_ENV) =>
      networkEnv === "mainnet" ? "137" : "80001",
    uniswapV3Router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    currencies: {
      MATIC: { address: ethers.constants.AddressZero },
      USDC: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
            : "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
      },
      ETH: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
            : "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
      },
    },
  },
};

const populateWETH9 = () => {
  ValidNetworks.forEach((network) => {
    const mainnetChainId = ethers.BigNumber.from(
      NetworksConfig[network].chainId("mainnet")
    ).toNumber();
    const testnetChainId = ethers.BigNumber.from(
      NetworksConfig[network].chainId("testnet")
    ).toNumber();

    WETH9[mainnetChainId] = new Token(
      mainnetChainId,
      NetworksConfig[network].wrappedNativeCurrency("mainnet"),
      CurrencyMeta[NetworksConfig[network].nativeCurrency].decimals,
      NetworksConfig[network].nativeCurrency,
      NetworksConfig[network].nativeCurrency
    );
    WETH9[testnetChainId] = new Token(
      testnetChainId,
      NetworksConfig[network].wrappedNativeCurrency("testnet"),
      CurrencyMeta[NetworksConfig[network].nativeCurrency].decimals,
      NetworksConfig[network].nativeCurrency,
      NetworksConfig[network].nativeCurrency
    );
  });
};
populateWETH9();
