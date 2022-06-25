import { ethers, BigNumberish } from "ethers";
import { catchAsync, convertToQuoteCurrency } from "../utils";
import { CurrencySymbols, Networks, TimePeriod, WalletStatus } from "../config";
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
  balance: BigNumberish;
  previousBalanceInQuoteCurrency: BigNumberish;
  currentBalanceInQuoteCurrency: BigNumberish;
}

interface PostResponse {
  walletStatus: WalletStatus;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

export const post = catchAsync(async (req, res) => {
  const { address } = req.params;
  const { quoteCurrency, network, timePeriod, currencies } =
    req.body as RequestBody;

  const [
    walletStatus,
    previousCurrencyBalances,
    currentCurrencyBalances,
    previousQuotes,
    currentQuotes,
  ] = await Promise.all([
    AlchemyService.getWalletStatus(network, address),
    ReceiptService.getClosestBlockForTimePeriod(network, timePeriod).then(
      (blockNumber) =>
        AlchemyService.getCurrencyBalances(
          network,
          address,
          currencies,
          blockNumber
        )
    ),
    AlchemyService.getCurrencyBalances(network, address, currencies),
    QuoteService.getClosestQuotes(quoteCurrency, currencies, timePeriod),
    QuoteService.getClosestQuotes(quoteCurrency, currencies),
  ]);

  const response: PostResponse = {
    walletStatus,
    walletBalance: currencies.reduce(
      (prev, curr) => {
        return {
          ...prev,
          previousBalance: ethers.BigNumber.from(prev.previousBalance)
            .add(
              convertToQuoteCurrency(
                previousCurrencyBalances[curr],
                curr,
                quoteCurrency,
                previousQuotes[curr]
              )
            )
            .toString(),
          currentBalance: ethers.BigNumber.from(prev.currentBalance)
            .add(
              convertToQuoteCurrency(
                currentCurrencyBalances[curr],
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
      balance: ethers.BigNumber.from(
        currentCurrencyBalances[currency]
      ).toString(),
      previousBalanceInQuoteCurrency: convertToQuoteCurrency(
        previousCurrencyBalances[currency],
        currency,
        quoteCurrency,
        previousQuotes[currency]
      ).toString(),
      currentBalanceInQuoteCurrency: convertToQuoteCurrency(
        currentCurrencyBalances[currency],
        currency,
        quoteCurrency,
        currentQuotes[currency]
      ).toString(),
    })),
  };

  res.send(response);
});
