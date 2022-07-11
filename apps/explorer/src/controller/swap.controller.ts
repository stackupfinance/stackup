import httpStatus from "http-status";
import { BigNumberish, ethers } from "ethers";
import { catchAsync, ApiError } from "../utils";
import { Networks, CurrencySymbols } from "../config";
import * as UniswapService from "../services/uniswap.service";

export const quote = catchAsync(async (req, res) => {
  const { network, baseCurrency, quoteCurrency, value, address } =
    req.query as {
      network: Networks;
      baseCurrency: CurrencySymbols;
      quoteCurrency: CurrencySymbols;
      value: BigNumberish;
      address: string;
    };
  if (baseCurrency === quoteCurrency) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Base and quote currencies must be different"
    );
  }
  if (ethers.BigNumber.from(value).isZero()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Value must be more than zero");
  }

  res.send({
    quote: await UniswapService.getOptimalQuote(
      network,
      baseCurrency,
      quoteCurrency,
      value,
      address
    ),
  });
});
