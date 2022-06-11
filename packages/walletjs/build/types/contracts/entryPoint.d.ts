import { ethers } from "ethers";
export declare const deploySalt: string;
export declare const deployInitCode: ethers.utils.BytesLike;
export declare const address: string;
export declare const interface: ethers.utils.Interface;
export declare const getInstance: (signerOrProvider: ethers.Signer | ethers.providers.Provider) => ethers.Contract;
