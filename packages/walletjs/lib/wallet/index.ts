import { ethers } from "ethers";
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";
import scrypt, { ProgressCallback } from "scrypt-js";
import * as Wallet from "../contracts/wallet";
import * as proxy from "./proxy";

// @ts-ignore
import buffer = require("scrypt-js/thirdparty/buffer");
require("scrypt-js/thirdparty/setImmediate");

export interface WalletInstance {
  walletAddress: string;
  initImplementation: string;
  initOwner: string;
  initGuardians: Array<string>;
  salt: string;
  encryptedSigner: string;
}

type ScryptFn = (
  password: ArrayLike<number>,
  salt: ArrayLike<number>,
  N: number,
  r: number,
  p: number,
  dkLen: number,
  callback?: ProgressCallback | undefined
) => Promise<Uint8Array>;

let _scryptFn: ScryptFn = scrypt.scrypt;
export const _overrideScryptFn = (fn: ScryptFn): void => {
  _scryptFn = fn;
};

interface CreateRandomOpts {
  guardians?: Array<string>;
}

const _generatePasswordKey = async (
  password: string,
  salt: string
): Promise<Uint8Array> => {
  const N = 16384,
    r = 8,
    p = 1,
    dkLen = 32;
  const passwordBuffer = new buffer.SlowBuffer(password.normalize("NFKC"));
  const saltBuffer = new buffer.SlowBuffer(salt.normalize("NFKC"));
  return _scryptFn(passwordBuffer, saltBuffer, N, r, p, dkLen);
};

export const decryptSigner = async (
  wallet: WalletInstance,
  password: string,
  salt: string
) => {
  try {
    const passwordKey = await _generatePasswordKey(password, salt);
    const privateKey = AES.decrypt(
      wallet.encryptedSigner,
      Buffer.from(passwordKey).toString("hex")
    ).toString(Utf8);
    if (!ethers.utils.isBytesLike(privateKey)) return;

    return new ethers.Wallet(privateKey);
  } catch (error: any) {
    if (error.message !== "Malformed UTF-8 data") {
      throw error;
    }
  }
};

export const reencryptSigner = async (
  wallet: WalletInstance,
  password: string,
  newPassword: string,
  salt: string
) => {
  try {
    const passwordKey = await _generatePasswordKey(password, salt);
    const privateKey = AES.decrypt(
      wallet.encryptedSigner,
      Buffer.from(passwordKey).toString("hex")
    ).toString(Utf8);
    if (!privateKey) return;

    const newPasswordKey = await _generatePasswordKey(newPassword, salt);
    return AES.encrypt(
      privateKey,
      Buffer.from(newPasswordKey).toString("hex")
    ).toString();
  } catch (error: any) {
    if (error.message !== "Malformed UTF-8 data") {
      throw error;
    }
  }
};

export const createRandom = async (
  password: string,
  salt: string,
  opts: CreateRandomOpts = {}
): Promise<WalletInstance> => {
  const signer = new ethers.Wallet(ethers.utils.randomBytes(32));

  const initImplementation = Wallet.address;
  const initOwner = signer.address;
  const initGuardians = opts.guardians ?? [];
  const walletAddress = proxy.getAddress(
    initImplementation,
    initOwner,
    initGuardians
  );
  const passwordKey = await _generatePasswordKey(password, salt);
  return {
    walletAddress,
    initImplementation,
    initOwner,
    initGuardians,
    salt,
    encryptedSigner: AES.encrypt(
      signer.privateKey,
      Buffer.from(passwordKey).toString("hex")
    ).toString(),
  };
};

export * as access from "./access";
export * as decodeCallData from "./decodeCallData";
export * as encodeFunctionData from "./encodeFunctionData";
export * as message from "./message";
export * as proxy from "./proxy";
export * as userOperations from "./userOperations";
