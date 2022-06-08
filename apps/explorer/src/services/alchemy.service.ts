import axios from "axios";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { ethers, BigNumberish } from "ethers";
import { contracts } from "@stackupfinance/walletjs";
import { Env, Networks, NetworksConfig, CurrencySymbols } from "../config";
import { getRPC } from "../utils";

interface TokenBalanceResponse {
  id: number;
  result: string;
}
type CurrencyBalances = Record<CurrencySymbols, BigNumberish>;

const BASE_CURRENCY_BALANCE_MAP: CurrencyBalances = {
  USDC: ethers.constants.Zero,
  ETH: ethers.constants.Zero,
  MATIC: ethers.constants.Zero,
};

const ALCHEMY_POLYGON_INSTANCE = createAlchemyWeb3(Env.ALCHEMY_POLYGON_RPC);

const getInstance = (network: Networks) => {
  switch (network) {
    case "Polygon":
      return ALCHEMY_POLYGON_INSTANCE;

    default:
      return ALCHEMY_POLYGON_INSTANCE;
  }
};

export const getBlockNumber = async (network: Networks) => {
  const web3 = getInstance(network);

  const data = await web3.eth.getBlockNumber();

  return data;
};

export const getTransactionReceipts = async (
  network: Networks,
  blockNumber: number
) => {
  const web3 = getInstance(network);

  const data = await web3.alchemy.getTransactionReceipts({
    blockNumber: ethers.utils.hexValue(blockNumber),
  });

  return data;
};

const getLatestCurrencyBalances = async (
  network: Networks,
  address: string,
  currencies: Array<CurrencySymbols>
): Promise<CurrencyBalances> => {
  const web3 = getInstance(network);

  let balances: Record<string, BigNumberish>;
  const nativeCurrency = NetworksConfig[network].nativeCurrency;
  if (currencies.includes(nativeCurrency)) {
    const [ethBalance, data] = await Promise.all([
      web3.eth.getBalance(address),
      web3.alchemy.getTokenBalances(
        address,
        currencies
          .filter((currency) => currency !== nativeCurrency)
          .map(
            (currency) => NetworksConfig[network].currencies[currency].address
          )
      ),
    ]);

    balances = data.tokenBalances.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.contractAddress]: ethers.BigNumber.from(curr.tokenBalance),
        };
      },
      { [ethers.constants.AddressZero]: ethers.BigNumber.from(ethBalance) }
    );
  } else {
    const data = await web3.alchemy.getTokenBalances(
      address,
      currencies.map(
        (currency) => NetworksConfig[network].currencies[currency].address
      )
    );

    balances = data.tokenBalances.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.contractAddress]: ethers.BigNumber.from(curr.tokenBalance),
      };
    }, {});
  }

  return currencies.reduce(
    (prev, curr) => {
      return {
        ...prev,
        [curr]: balances[NetworksConfig[network].currencies[curr].address],
      };
    },
    { ...BASE_CURRENCY_BALANCE_MAP }
  );
};

const getCurrencyBalancesAtBlock = async (
  network: Networks,
  address: string,
  currencies: Array<CurrencySymbols>,
  blockNumber: string
): Promise<CurrencyBalances> => {
  const batch = currencies.map((currency, id) => {
    const currencyAddress =
      NetworksConfig[network].currencies[currency].address;
    return {
      method:
        currencyAddress === ethers.constants.AddressZero
          ? "eth_getBalance"
          : "eth_call",
      params: [
        currencyAddress === ethers.constants.AddressZero
          ? address
          : {
              to: currencyAddress,
              data: contracts.Erc20.interface.encodeFunctionData("balanceOf", [
                address,
              ]),
            },
        blockNumber,
      ],
      id,
      jsonrpc: "2.0",
    };
  });

  const response = await axios.post<Array<TokenBalanceResponse>>(
    getRPC(network),
    batch
  );
  return response.data.reduce(
    (prev, curr) => {
      return {
        ...prev,
        [currencies[curr.id]]: ethers.BigNumber.from(curr.result),
      };
    },
    { ...BASE_CURRENCY_BALANCE_MAP }
  );
};

export const getCurrencyBalances = async (
  network: Networks,
  address: string,
  tokens: Array<CurrencySymbols>,
  blockNumber?: string
) => {
  if (blockNumber) {
    return getCurrencyBalancesAtBlock(network, address, tokens, blockNumber);
  } else {
    return getLatestCurrencyBalances(network, address, tokens);
  }
};
