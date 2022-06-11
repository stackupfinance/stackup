import { ethers } from "ethers";
import { ProgressCallback } from "scrypt-js";
export interface WalletInstance {
    walletAddress: string;
    initImplementation: string;
    initOwner: string;
    initGuardians: Array<string>;
    salt: string;
    encryptedSigner: string;
}
declare type ScryptFn = (password: ArrayLike<number>, salt: ArrayLike<number>, N: number, r: number, p: number, dkLen: number, callback?: ProgressCallback | undefined) => Promise<Uint8Array>;
export declare const _overrideScryptFn: (fn: ScryptFn) => void;
interface CreateRandomOpts {
    guardians?: Array<string>;
}
export declare const decryptSigner: (wallet: WalletInstance, password: string, salt: string) => Promise<ethers.Wallet | undefined>;
export declare const reencryptSigner: (wallet: WalletInstance, password: string, newPassword: string, salt: string) => Promise<string | undefined>;
export declare const createRandom: (password: string, salt: string, opts?: CreateRandomOpts) => Promise<WalletInstance>;
export * as access from "./access";
export * as decodeCallData from "./decodeCallData";
export * as encodeFunctionData from "./encodeFunctionData";
export * as message from "./message";
export * as proxy from "./proxy";
export * as userOperations from "./userOperations";
