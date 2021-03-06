import { BigNumberish, BytesLike } from "ethers";
export declare const ERC20Approve: (tokenAddress: string, spender: string, value: BigNumberish) => string;
export declare const ERC20Transfer: (tokenAddress: string, to: string, value: BigNumberish) => string;
export declare const executeUserOp: (to: string, value?: BigNumberish, data?: BytesLike) => string;
export declare const initialize: (owner: string, guardians: Array<string>) => string;
export declare const transferOwner: (newOwner: string) => string;
export declare const grantGuardian: (guardian: string) => string;
export declare const revokeGuardian: (guardian: string) => string;
export declare const addEntryPointStake: (value: BigNumberish) => string;
export declare const upgradeTo: (newImplementation: string) => string;
