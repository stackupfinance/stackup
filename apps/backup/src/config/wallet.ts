export interface WalletInstance {
  walletAddress: string;
  initImplementation: string;
  initOwner: string;
  initGuardians: Array<string>;
  salt: string;
  encryptedSigner: string;
}
