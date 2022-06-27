import { ethers } from "ethers";
import { IUserOperation } from "../constants/userOperations";
export declare const fromUserOperation: (userOp: IUserOperation) => ethers.utils.TransactionDescription;
export declare const Erc20FromExecuteUserOp: (wcd: ethers.utils.TransactionDescription) => ethers.utils.TransactionDescription | undefined;
