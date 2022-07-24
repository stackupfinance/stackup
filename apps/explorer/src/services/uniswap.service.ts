import { BigNumberish, BytesLike, ethers } from "ethers";
import { AlphaRouter } from "@uniswap/smart-order-router";
import {
  Token,
  Ether,
  CurrencyAmount,
  TradeType,
  Percent,
} from "@uniswap/sdk-core";
import {
  CurrencySymbols,
  CurrencyMeta,
  Networks,
  NetworksConfig,
} from "../config";
import { getRPC } from "../utils";

export interface OptimalQuote {
  amount: BigNumberish;
  rate: BigNumberish;
  transaction: {
    to: string;
    data: BytesLike;
    value: BigNumberish;
    gas: BigNumberish;
    gasPrice: BigNumberish;
  };
}

const routerInstances: Partial<Record<Networks, AlphaRouter>> = {};
const getRouter = (network: Networks) => {
  if (!routerInstances[network]) {
    const router = new AlphaRouter({
      chainId: ethers.BigNumber.from(
        NetworksConfig[network].chainId()
      ).toNumber(),
      provider: new ethers.providers.JsonRpcProvider(getRPC(network)),
    });
    routerInstances[network] = router;
  }

  return routerInstances[network] as AlphaRouter;
};

export const getOptimalQuote = async (
  network: Networks,
  baseCurrency: CurrencySymbols,
  quoteCurrency: CurrencySymbols,
  value: BigNumberish,
  address: string
): Promise<OptimalQuote | null> => {
  const chainId = ethers.BigNumber.from(
    NetworksConfig[network].chainId()
  ).toNumber();
  const baseToken =
    baseCurrency === NetworksConfig[network].nativeCurrency
      ? Ether.onChain(chainId)
      : new Token(
          chainId,
          NetworksConfig[network].currencies[baseCurrency].address,
          CurrencyMeta[baseCurrency].decimals,
          baseCurrency,
          baseCurrency
        );
  const quoteToken =
    quoteCurrency === NetworksConfig[network].nativeCurrency
      ? Ether.onChain(chainId)
      : new Token(
          chainId,
          NetworksConfig[network].currencies[quoteCurrency].address,
          CurrencyMeta[quoteCurrency].decimals,
          quoteCurrency,
          quoteCurrency
        );

  const route = await getRouter(network).route(
    CurrencyAmount.fromRawAmount(baseToken, value.toString()),
    quoteToken,
    TradeType.EXACT_INPUT,
    {
      recipient: address,
      slippageTolerance: new Percent(5, 1000), // 0.5%
      deadline: Math.floor(Date.now() / 1000 + 1800), // 30 minutes
    }
  );

  if (!route || !route.methodParameters || !route.gasPriceWei) {
    return null;
  }
  const amount = ethers.utils.parseUnits(
    route.quote.toSignificant(),
    CurrencyMeta[quoteCurrency].decimals
  );
  const rate = amount
    .mul(ethers.BigNumber.from(10).pow(CurrencyMeta[baseCurrency].decimals))
    .div(value);
  return {
    amount: amount.toString(),
    rate: rate.toString(),
    transaction: {
      to: NetworksConfig[network].uniswapV3Router,
      data: route.methodParameters.calldata,
      value: ethers.BigNumber.from(route.methodParameters.value).toString(),
      gas: ethers.BigNumber.from(route.estimatedGasUsed).toString(),
      gasPrice: ethers.BigNumber.from(route.gasPriceWei).toString(),
    },
  };
};
