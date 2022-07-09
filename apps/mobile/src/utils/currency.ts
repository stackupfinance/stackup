import {ethers, BigNumberish} from 'ethers';
import {CurrencySymbols, CurrencyMeta} from '../config';

const USDCDisplay = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const TO_FLOAT_REGEX = /[^\d.-]/g;

const displayGenericToken = (value: BigNumberish, symbol: CurrencySymbols) => {
  return `${ethers.utils.commify(
    ethers.utils.formatUnits(
      ethers.BigNumber.from(value),
      CurrencyMeta[symbol].decimals,
    ),
  )} ${symbol}`;
};

export const stringToValidFloat = (value: string) =>
  parseFloat(value.replace(TO_FLOAT_REGEX, '')).toString();

export const formatCurrency = (
  value: BigNumberish,
  symbol: CurrencySymbols,
): string => {
  switch (symbol) {
    case 'USDC':
      return USDCDisplay.format(
        parseFloat(
          ethers.utils.formatUnits(
            ethers.BigNumber.from(value),
            CurrencyMeta[symbol].decimals,
          ),
        ),
      );

    default:
      return displayGenericToken(value, symbol);
  }
};

export const parseCurrency = (
  value: string,
  symbol: CurrencySymbols,
): BigNumberish => {
  return ethers.utils
    .parseUnits(value, CurrencyMeta[symbol].decimals)
    .toString();
};

export const valueChange = (
  prev: BigNumberish,
  curr: BigNumberish,
): BigNumberish => {
  return ethers.BigNumber.from(curr).gte(prev)
    ? ethers.BigNumber.from(curr).sub(prev)
    : ethers.BigNumber.from(prev).sub(curr);
};

export const percentChange = (
  prev: BigNumberish,
  curr: BigNumberish,
  currency: CurrencySymbols,
): string => {
  if (
    ethers.BigNumber.from(prev).isZero() &&
    ethers.BigNumber.from(curr).isZero()
  ) {
    return parseFloat(ethers.constants.Zero.toString()).toFixed(2);
  } else if (ethers.BigNumber.from(prev).isZero()) {
    return '∞';
  }

  return Math.abs(
    (parseFloat(
      ethers.utils.formatUnits(
        ethers.BigNumber.from(curr).sub(prev),
        CurrencyMeta[currency].decimals,
      ),
    ) /
      parseFloat(
        ethers.utils.formatUnits(
          ethers.BigNumber.from(prev),
          CurrencyMeta[currency].decimals,
        ),
      )) *
      100,
  ).toFixed(2);
};
