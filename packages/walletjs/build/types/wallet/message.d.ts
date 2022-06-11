import { BigNumberish } from "ethers";
import { IUserOperation } from "../constants/userOperations";
export declare const paymasterData: (op: IUserOperation, paymasterFee: BigNumberish, erc20Token: string, priceFeed: string) => Uint8Array;
export declare const userOperation: (op: IUserOperation) => string;
export declare const requestId: (op: IUserOperation, entryPoint: string, chainId: BigNumberish) => string;
