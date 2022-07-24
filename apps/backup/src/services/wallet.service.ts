import httpStatus from "http-status";
import { wallet } from "@stackupfinance/walletjs";
import Wallet from "../models/wallet.model";
import { ApiError } from "../utils";

export const save = async (walletInstance: wallet.WalletInstance) => {
  if (await Wallet.findOne({ walletAddress: walletInstance.walletAddress })) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Encrypted wallet backup already exist"
    );
  }

  return Wallet.create(walletInstance);
};

export const findByWalletAddress = async (walletAddress: string) => {
  return Wallet.findOne({ walletAddress });
};

export const updateEncryptedSignerByWalletAddress = async (
  walletAddress: string,
  encryptedSigner: wallet.WalletInstance["encryptedSigner"]
) => {
  return Wallet.updateOne({ walletAddress }, { encryptedSigner });
};
