import { BigNumberish } from "ethers";
import { constants } from "@stackupfinance/walletjs";
import { catchAsync } from "../utils";
import { Env, Networks, CurrencySymbols, DefaultFees } from "../config";
import * as AlchemyService from "../services/alchemy.service";

interface SignReqestBody {
  userOperations: Array<constants.userOperations.IUserOperation>;
}

interface SignResponse {
  userOperations: Array<constants.userOperations.IUserOperation>;
}

interface StatusResponse {
  address: string;
  fees: Record<CurrencySymbols, BigNumberish>;
  allowances: Record<CurrencySymbols, BigNumberish>;
}

export const sign = catchAsync((req, res) => {
  const { userOperations } = req.body as SignReqestBody;

  const response: SignResponse = {
    userOperations,
  };

  res.send(response);
});

export const status = catchAsync(async (req, res) => {
  const { network, address } = req.query as {
    network: Networks;
    address: string;
  };

  const response: StatusResponse = {
    address: Env.PAYMASTER_ADDRESS,
    fees: DefaultFees,
    allowances: {
      USDC: await AlchemyService.getCurrencyAllowanceForPaymaster(
        network,
        "USDC",
        address
      ),
    },
  };

  res.send(response);
});
