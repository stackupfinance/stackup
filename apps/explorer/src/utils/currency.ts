import { ethers, BigNumberish } from "ethers";
import {
  CurrencySymbols,
  CurrencyMeta,
  Networks,
  NetworksConfig,
} from "../config";

type AddressToCurrencyMap = Record<string, CurrencySymbols>;
type AddressToCurrencyMapByNetwork = Partial<
  Record<Networks, AddressToCurrencyMap>
>;

export const convertToQuoteCurrency = (
  value: BigNumberish,
  currency: CurrencySymbols,
  quoteCurrency: CurrencySymbols,
  price: number
): BigNumberish => {
  const baseValue = ethers.BigNumber.from(value);
  const baseCurrencyDecimals = CurrencyMeta[currency].decimals;
  const quoteCurrencyDecimals = CurrencyMeta[quoteCurrency].decimals;
  const quotePrice = ethers.utils.parseUnits(
    price.toFixed(quoteCurrencyDecimals),
    quoteCurrencyDecimals
  );

  return baseValue
    .mul(quotePrice)
    .div(ethers.BigNumber.from(10).pow(baseCurrencyDecimals));
};

const addressToCurrencyMapInstances: AddressToCurrencyMapByNetwork = {};
export const getCurrencyFromAddress = (network: Networks, address: string) => {
  if (!addressToCurrencyMapInstances[network]) {
    addressToCurrencyMapInstances[network] = Object.entries(
      NetworksConfig[network].currencies
    ).reduce<AddressToCurrencyMap>((prev, [currency, config]) => {
      prev[config.address] = currency as CurrencySymbols;
      return prev;
    }, {});
  }

  return addressToCurrencyMapInstances[network]?.[address];
};
