import httpStatus from "http-status";
import { wallet } from "@stackupfinance/walletjs";
import { catchAsync, ApiError } from "../utils";
import { PatchWalletInstance, DefaultNetwork } from "../config";
import * as WalletService from "../services/wallet.service";
import * as VerificationService from "../services/verification.service";

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

export const updateEncryptedSigner = catchAsync(async (req, res) => {
  const { timestamp, signature, encryptedSigner, walletAddress } =
    req.body as PatchWalletInstance;

  const encryptedWallet = await WalletService.findByWalletAddress(
    walletAddress
  );
  if (!encryptedWallet) {
    throw new ApiError(httpStatus.NOT_FOUND, "Encrypted backup not found");
  }

  if (
    !(await VerificationService.verifySignatureToUpdateEncryptedSigner(
      DefaultNetwork,
      timestamp,
      signature,
      encryptedSigner,
      encryptedWallet
    ))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Signature not valid");
  }

  await WalletService.updateEncryptedSignerByWalletAddress(
    walletAddress,
    encryptedSigner
  );
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
