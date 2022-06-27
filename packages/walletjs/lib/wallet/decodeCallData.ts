import { ethers } from "ethers";
import * as Wallet from "../contracts/wallet";
import * as ERC20 from "../contracts/erc20";
import { IUserOperation } from "../constants/userOperations";

export const fromUserOperation = (userOp: IUserOperation) => {
  return Wallet.interface.parseTransaction({ data: userOp.callData });
};

export const Erc20FromExecuteUserOp = (
  wcd: ethers.utils.TransactionDescription
) => {
  try {
    return ERC20.interface.parseTransaction({ data: wcd.args.data });
  } catch (_error) {
    return undefined;
  }
};
