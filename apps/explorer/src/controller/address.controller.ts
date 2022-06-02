import { ethers, BigNumberish } from "ethers";
import { catchAsync } from "../utils";
import { CurrencySymbols, TimePeriod } from "../config";
// import * as AlchemyService from "../services/alchemy.service";

interface WalletBalance {
  currency: CurrencySymbols;
  previousBalance: BigNumberish;
  currentBalance: BigNumberish;
}

interface TokenBalance {
  currency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  previousBalanceInQuoteCurrency: BigNumberish;
  currentBalanceInQuoteCurrency: BigNumberish;
}

interface GetResponse {
  timePeriod: TimePeriod;
  walletBalance: WalletBalance;
  tokenBalances: Array<TokenBalance>;
}

export const get = catchAsync(async (req, res) => {
  // const { address } = req.params;

  // console.log(await AlchemyService.getBlockNumber("Polygon"));
  // console.log(await AlchemyService.getTransactionReceipts("Polygon", 26570764));

  const response: GetResponse = {
    timePeriod: "Max",
    walletBalance: {
      currency: "USDC",
      previousBalance: ethers.constants.Zero,
      currentBalance: ethers.constants.Zero,
    },
    tokenBalances: [],
  };

  res.send(response);
});
