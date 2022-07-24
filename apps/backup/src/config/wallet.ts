import { BytesLike } from "ethers";
import { wallet } from "@stackupfinance/walletjs";

export interface PatchWalletInstance extends wallet.WalletInstance {
  signature: BytesLike;
  timestamp: number;
}
