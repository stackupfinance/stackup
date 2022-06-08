import { ethers, BigNumberish } from "ethers";
import { CurrencySymbols, CurrencyMeta } from "../config";

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
