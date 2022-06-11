import * as Wallet from "../contracts/wallet";
import { IUserOperation } from "../constants/userOperations";

export const fromUserOperation = (userOp: IUserOperation) => {
  return Wallet.interface.parseTransaction({ data: userOp.callData });
};
