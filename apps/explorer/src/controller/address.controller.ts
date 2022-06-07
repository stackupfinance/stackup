import httpStatus from "http-status";
import { ethers, BigNumberish } from "ethers";
import { catchAsync, ApiError, convertToQuoteCurrency } from "../utils";
import { CurrencySymbols, Networks, TimePeriod } from "../config";
import * as ReceiptService from "../services/receipt.service";
import * as AlchemyService from "../services/alchemy.service";
import * as QuoteService from "../services/quote.service";

interface RequestBody {
  quoteCurrency: CurrencySymbols;
  network: Networks;
  timePeriod: TimePeriod;
  currencies: Array<CurrencySymbols>;
}

interface WalletBalance {
  quoteCurrency: CurrencySymbols;
  previousBalance: BigNumberish;
  currentBalance: BigNumberish;
}

interface CurrencyBalance {
  currency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  previousBalanceInQuoteCurrency: BigNumberish;
  currentBalanceInQuoteCurrency: BigNumberish;
}

interface PostResponse {
  timePeriod: TimePeriod;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

export const post = catchAsync(async (req, res) => {
  const { address } = req.params;
  const { quoteCurrency, network, timePeriod, currencies } =
    req.body as RequestBody;

  const [previousBlockNumber, previousQuotes, currentQuotes] =
    await Promise.all([
      ReceiptService.getClosestBlockForTimePeriod(network, timePeriod),
      QuoteService.getClosestQuotes(quoteCurrency, currencies, timePeriod),
      QuoteService.getClosestQuotes(quoteCurrency, currencies),
    ]);
  if (!previousBlockNumber) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Previous block not found"
    );
  }

  const [previousCurrencyBalances, currentCurrencyBalances] = await Promise.all(
    [
      AlchemyService.getCurrencyBalances(
        network,
        address,
        currencies,
        previousBlockNumber
      ),
      AlchemyService.getCurrencyBalances(network, address, currencies),
    ]
  );

  const response: PostResponse = {
    timePeriod,

    walletBalance: currencies.reduce(
      (prev, curr) => {
        return {
          ...prev,
          previousBalance: ethers.BigNumber.from(prev.previousBalance)
            .add(
              convertToQuoteCurrency(
                previousCurrencyBalances[curr] ?? ethers.constants.Zero,
                curr,
                quoteCurrency,
                previousQuotes[curr]
              )
            )
            .toString(),
          currentBalance: ethers.BigNumber.from(prev.currentBalance)
            .add(
              convertToQuoteCurrency(
                currentCurrencyBalances[curr] ?? ethers.constants.Zero,
                curr,
                quoteCurrency,
                currentQuotes[curr]
              )
            )
            .toString(),
        };
      },
      {
        quoteCurrency,
        previousBalance: "0",
        currentBalance: "0",
      }
    ),

    currencies: currencies.map((currency) => ({
      currency,
      quoteCurrency,
      previousBalanceInQuoteCurrency: convertToQuoteCurrency(
        previousCurrencyBalances[currency] ?? ethers.constants.Zero,
        currency,
        quoteCurrency,
        previousQuotes[currency]
      ).toString(),
      currentBalanceInQuoteCurrency: convertToQuoteCurrency(
        currentCurrencyBalances[currency] ?? ethers.constants.Zero,
        currency,
        quoteCurrency,
        currentQuotes[currency]
      ).toString(),
    })),
  };

  res.send(response);
});
