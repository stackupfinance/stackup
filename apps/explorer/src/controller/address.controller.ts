import httpStatus from "http-status";
import { ethers, BigNumberish } from "ethers";
import { catchAsync, ApiError } from "../utils";
import { CurrencySymbols, Networks, TimePeriod } from "../config";
import * as ReceiptService from "../services/receipt.service";
import * as AlchemyService from "../services/alchemy.service";

interface RequestBody {
  network: Networks;
  timePeriod: TimePeriod;
  currencies: Array<CurrencySymbols>;
}

interface WalletBalance {
  currency: CurrencySymbols;
  previousBalance: BigNumberish;
  currentBalance: BigNumberish;
}

interface CurrencyBalance {
  currency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  previousBalanceInQuoteCurrency: BigNumberish;
  currentBalanceInQuoteCurrency: BigNumberish;
}

interface GetResponse {
  timePeriod: TimePeriod;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

export const post = catchAsync(async (req, res) => {
  const { address } = req.params;
  const { network, timePeriod, currencies } = req.body as RequestBody;

  const previousBlockNumber = await ReceiptService.getClosestBlockForTimePeriod(
    network,
    timePeriod
  );
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

  const response: GetResponse = {
    timePeriod,
    walletBalance: {
      currency: "USDC",
      previousBalance: ethers.constants.Zero,
      currentBalance: ethers.constants.Zero,
    },
    currencies: currencies.map((currency) => ({
      currency,
      quoteCurrency: "USDC",
      previousBalanceInQuoteCurrency:
        previousCurrencyBalances[currency] ?? ethers.constants.Zero,
      currentBalanceInQuoteCurrency:
        currentCurrencyBalances[currency] ?? ethers.constants.Zero,
    })),
  };

  res.send(response);
});
