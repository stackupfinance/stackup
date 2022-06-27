import { BigNumberish } from "ethers";
import { IUserOperation } from "../constants/userOperations";
export declare enum PaymasterMode {
    FULL = 0,
    FEE_ONLY = 1,
    GAS_ONLY = 2,
    FREE = 3
}
export interface PaymasterData {
    fee: BigNumberish;
    mode: PaymasterMode;
    token: string;
    feed: string;
    signature?: string;
}
export declare const paymasterData: (op: IUserOperation, fee: BigNumberish, mode: PaymasterMode, token: string, feed: string) => Uint8Array;
export declare const userOperation: (op: IUserOperation) => string;
export declare const requestId: (op: IUserOperation, entryPoint: string, chainId: BigNumberish) => string;
