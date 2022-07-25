import {ethers, BigNumberish} from 'ethers';
import {CurrencySymbols, CurrencyMeta} from '../config';

const USDCDisplay = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const TO_FLOAT_REGEX = /[^\d.-]/g;
const DECIMAL_PLACES = 6;
const MULTIPLIER = Math.pow(10, DECIMAL_PLACES);

// Return currency value to $DECIMAL_PLACES rounded down
const displayGenericToken = (value: BigNumberish, symbol: CurrencySymbols) => {
  return `${ethers.utils.commify(
    (
      Math.floor(
        parseFloat(
          ethers.utils.formatUnits(
            ethers.BigNumber.from(value),
            CurrencyMeta[symbol].decimals,
          ),
        ) * MULTIPLIER,
      ) / MULTIPLIER
    ).toFixed(DECIMAL_PLACES),
  )} ${symbol}`;
};

export const stringToValidFloat = (value: string) => {
  const floatString = value.replace(TO_FLOAT_REGEX, '');
  if (floatString.split('.')[1]?.length > DECIMAL_PLACES) {
    return parseFloat(floatString).toFixed(DECIMAL_PLACES);
  }
  return parseFloat(floatString).toString();
};

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

export const formatCurrencyNoSymbol = (
  value: BigNumberish,
  symbol: CurrencySymbols,
) => {
  return formatCurrency(value, symbol).replace(`${symbol}`, '').trimEnd();
};

export const formatRate = (
  baseCurrency: CurrencySymbols,
  quoteCurrency: CurrencySymbols,
  rate: BigNumberish,
) => {
  return `${formatCurrency(
    ethers.utils.parseUnits('1', CurrencyMeta[baseCurrency].decimals),
    baseCurrency,
  )} ≈ ${formatCurrency(rate, quoteCurrency)}`;
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
