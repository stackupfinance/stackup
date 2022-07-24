import { ethers, BytesLike } from "ethers";
import { wallet, contracts } from "@stackupfinance/walletjs";
import { Networks } from "../config";
import { getRPC } from "../utils";

const isTimestampExpired = (timestamp: number) => {
  return Date.now() - timestamp > 60000; // 1 minute window
};

export const verifySignatureToUpdateEncryptedSigner = async (
  network: Networks,
  timestamp: number,
  signature: BytesLike,
  encryptedSigner: wallet.WalletInstance["encryptedSigner"],
  instance: wallet.WalletInstance
) => {
  if (isTimestampExpired(timestamp)) {
    return false;
  }
  const provider = new ethers.providers.JsonRpcProvider(getRPC(network));

  const recoveredAddress = ethers.utils.verifyMessage(
    `${encryptedSigner}${timestamp}`,
    signature
  );
  const ownerAddress = (await wallet.proxy.isCodeDeployed(
    provider,
    instance.walletAddress
  ))
    ? await contracts.Wallet.getInstance(provider)
        .attach(instance.walletAddress)
        .getOwner(0)
    : instance.initOwner;

  return recoveredAddress === ownerAddress;
};
