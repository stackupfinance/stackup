import { ethers } from "ethers";
export declare const isCodeDeployed: (provider: ethers.providers.Provider, walletAddress: string) => Promise<boolean>;
export declare const getAddress: (initImplementation: string, initOwner: string, initGuardians: Array<string>) => string;
export declare const getInitCode: (initImplementation: string, initOwner: string, initGuardians: Array<string>) => ethers.utils.BytesLike;
export declare const getNonce: (provider: ethers.providers.Provider, walletAddress: string) => Promise<any>;
