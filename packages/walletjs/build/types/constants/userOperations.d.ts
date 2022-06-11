export interface IUserOperation {
    sender: string;
    nonce: number;
    initCode: string;
    callData: string;
    callGas: number;
    verificationGas: number;
    preVerificationGas: number;
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
    paymaster: string;
    paymasterData: string;
    signature: string;
}
export declare const defaultGas = 215000;
export declare const defaultMaxFee = 50000000000;
export declare const defaultMaxPriorityFee = 50000000000;
export declare const initNonce = 0;
export declare const nullCode = "0x";
export declare const defaults: IUserOperation;
