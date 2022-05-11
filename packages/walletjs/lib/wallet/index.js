const { ethers } = require("ethers");
const AES = require("crypto-js/aes");
const scrypt = require("scrypt-js");
const buffer = require("scrypt-js/thirdparty/buffer");
require("scrypt-js/thirdparty/setImmediate");
const Utf8 = require("crypto-js/enc-utf8");
const EntryPoint = require("../contracts/entryPoint");
const Wallet = require("../contracts/wallet");
const proxy = require("./proxy");

let _scryptFn;
// eslint-disable-next-line no-undef
if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
  // Use a shim for scrypt if in React Native environment.
  _scryptFn = global.scrypt;
} else {
  _scryptFn = scrypt.scrypt;
}

const _generatePasswordKey = async (password, salt) => {
  const N = 16384,
    r = 8,
    p = 1,
    dkLen = 32;
  const passwordBuffer = new buffer.SlowBuffer(password.normalize("NFKC"));
  const saltBuffer = new buffer.SlowBuffer(salt.normalize("NFKC"));
  return _scryptFn(passwordBuffer, saltBuffer, N, r, p, dkLen);
};

module.exports.decryptSigner = async (wallet, password, salt) => {
  try {
    const passwordKey = await _generatePasswordKey(password, salt);
    const privateKey = AES.decrypt(
      wallet.encryptedSigner,
      Buffer.from(passwordKey).toString("hex")
    ).toString(Utf8);
    if (!privateKey) return;

    return new ethers.Wallet(privateKey);
  } catch (error) {
    if (error.message !== "Malformed UTF-8 data") {
      throw error;
    }
  }
};

module.exports.reencryptSigner = async (
  wallet,
  password,
  newPassword,
  salt
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
  } catch (error) {
    if (error.message !== "Malformed UTF-8 data") {
      throw error;
    }
  }
};

module.exports.createRandom = async (password, salt, opts = {}) => {
  const signer = new ethers.Wallet(ethers.utils.randomBytes(32));

  const initImplementation = Wallet.address;
  const initEntryPoint = EntryPoint.address;
  const initOwner = signer.address;
  const initGuardians = opts.guardians ?? [];
  const walletAddress = proxy.getAddress(
    initImplementation,
    initEntryPoint,
    initOwner,
    initGuardians
  );
  const passwordKey = await _generatePasswordKey(password, salt);
  return {
    walletAddress,
    initImplementation,
    initEntryPoint,
    initOwner,
    initGuardians,
    salt,
    encryptedSigner: AES.encrypt(
      signer.privateKey,
      Buffer.from(passwordKey).toString("hex")
    ).toString(),
  };
};

module.exports.access = require("./access");
module.exports.decodeCallData = require("./decodeCallData");
module.exports.encodeFunctionData = require("./encodeFunctionData");
module.exports.message = require("./message");
module.exports.proxy = proxy;
module.exports.userOperations = require("./userOperations");
