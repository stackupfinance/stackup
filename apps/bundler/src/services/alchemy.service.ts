import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { BigNumberish } from "ethers";
import { Env, Networks, NetworksConfig, CurrencySymbols } from "../config";

const ALCHEMY_POLYGON_INSTANCE = createAlchemyWeb3(Env.ALCHEMY_POLYGON_RPC);

const getInstance = (network: Networks) => {
  switch (network) {
    case "Polygon":
      return ALCHEMY_POLYGON_INSTANCE;

    default:
      return ALCHEMY_POLYGON_INSTANCE;
  }
};

export const getCurrencyAllowanceForPaymaster = async (
  network: Networks,
  currency: CurrencySymbols,
  walletAddress: string
): Promise<BigNumberish> => {
  const allowance = await getInstance(network).alchemy.getTokenAllowance({
    contract: NetworksConfig[network].currencies[currency].address,
    owner: walletAddress,
    spender: Env.PAYMASTER_ADDRESS,
  });

  return allowance;
};

export const getCurrencyBalanceForPaymaster = async (
  network: Networks,
  currency: CurrencySymbols,
  walletAddress: string
): Promise<BigNumberish> => {
  const balances = await getInstance(network).alchemy.getTokenBalances(
    walletAddress,
    [NetworksConfig[network].currencies[currency].address]
  );

  return balances.tokenBalances[0].tokenBalance ?? "0";
};
