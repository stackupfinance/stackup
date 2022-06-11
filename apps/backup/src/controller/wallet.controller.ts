import httpStatus from "http-status";
import { wallet } from "@stackupfinance/walletjs";
import { catchAsync, ApiError } from "../utils";
import * as WalletService from "../services/wallet.service";

interface PingRequestBody {
  walletAddress: string;
}

interface PingResponse {
  exist: boolean;
}

interface FetchRequestBody {
  walletAddress: string;
}

export const post = catchAsync(async (req, res) => {
  const encryptedWallet = req.body as wallet.WalletInstance;
  await WalletService.save(encryptedWallet);

  res.status(httpStatus.NO_CONTENT).send();
});

export const ping = catchAsync(async (req, res) => {
  const { walletAddress } = req.body as PingRequestBody;

  const encryptedWallet = await WalletService.findByWalletAddress(
    walletAddress
  );

  const response: PingResponse = {
    exist: Boolean(encryptedWallet),
  };

  res.send(response);
});

export const fetch = catchAsync(async (req, res) => {
  const { walletAddress } = req.body as FetchRequestBody;

  const encryptedWallet = await WalletService.findByWalletAddress(
    walletAddress
  );
  if (!encryptedWallet) {
    throw new ApiError(httpStatus.NOT_FOUND, "Encrypted backup not found");
  }

  const response: wallet.WalletInstance = {
    walletAddress: encryptedWallet.walletAddress,
    initImplementation: encryptedWallet.initImplementation,
    initOwner: encryptedWallet.initOwner,
    initGuardians: encryptedWallet.initGuardians,
    salt: encryptedWallet.salt,
    encryptedSigner: encryptedWallet.encryptedSigner,
  };
  res.send(response);
});
