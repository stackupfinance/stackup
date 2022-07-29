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
      BTC: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
            : "0x0d787a4a1548f673ed375445535a6c7A1EE56180",
      },
      UNI: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0xb33EaAd8d922B1083446DC23f610c2567fB5180f"
            : "0xDED33Fff66356AaffBD03a972ef9fd91fe620D3d",
      },
      AAVE: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0xD6DF932A45C0f255f85145f286eA0b292B21C90B"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      CRV: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x172370d5Cd63279eFa6d502DAB29171933a610AF"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      LDO: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      LINK: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0xb0897686c545045aFc77CF20eC7A532E3120E0F1"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      MKR: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x6f7C932e7684666C9fd1d44527765433e01fF61d"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      DAI: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      SUSHI: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      YFI: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0xDA537104D6A5edd53c6fBba9A898708E465260b6"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      DPI: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      },
      MVI: {
        address:
          Env.NETWORK_ENV === "mainnet"
            ? "0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1"
            : "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
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
