const { ethers } = require("ethers");
const EthCrypto = require("eth-crypto");
const AES = require("crypto-js/aes");
const scrypt = require("scrypt-js");
const buffer = require("scrypt-js/thirdparty/buffer");
require("scrypt-js/thirdparty/setImmediate");
const Utf8 = require("crypto-js/enc-utf8");
const SingletonFactory = require("../contracts/singletonFactory");
const EntryPoint = require("../contracts/entryPoint");
const Wallet = require("../contracts/wallet");
const walletProxy = require("../contracts/walletProxy");
const userOperation = require("../constants/userOperations");
const encodeFunctionData = require("./encodeFunctionData");

const generatePasswordKey = async (password, salt) => {
  const N = 16384,
    r = 8,
    p = 1,
    dkLen = 64;
  const passwordBuffer = new buffer.SlowBuffer(password.normalize("NFKC"));
  const saltBuffer = new buffer.SlowBuffer(salt.normalize("NFKC"));
  return scrypt.scrypt(passwordBuffer, saltBuffer, N, r, p, dkLen);
};

module.exports.decryptSigner = async (wallet, password, salt) => {
  try {
    const passwordKey = await generatePasswordKey(password, salt);
    const privateKey = AES.decrypt(
      wallet.encryptedSigner,
      Buffer.from(passwordKey).toString("hex")
    ).toString(Utf8);
    if (!privateKey) return;

    return new ethers.Wallet(privateKey);
  } catch (error) {
    console.error(error);
  }
};

module.exports.reencryptSigner = async (
  wallet,
  password,
  newPassword,
  salt
) => {
  try {
    const passwordKey = await generatePasswordKey(password, salt);
    const privateKey = AES.decrypt(
      wallet.encryptedSigner,
      Buffer.from(passwordKey).toString("hex")
    ).toString(Utf8);
    if (!privateKey) return;

    const newPasswordKey = await generatePasswordKey(newPassword, salt);
    return AES.encrypt(
      privateKey,
      Buffer.from(newPasswordKey).toString("hex")
    ).toString();
  } catch (error) {
    console.error(error);
  }
};

module.exports.initEncryptedIdentity = async (password, salt, opts = {}) => {
  const signer = EthCrypto.createIdentity();

  const initImplementation = Wallet.address;
  const initEntryPoint = EntryPoint.address;
  const initOwner = signer.address;
  const initGuardians = opts.guardians ?? [];
  const walletAddress = this.getAddress(
    initImplementation,
    initEntryPoint,
    initOwner,
    initGuardians
  );
  const passwordKey = await generatePasswordKey(password, salt);
  return {
    walletAddress,
    initImplementation,
    initEntryPoint,
    initOwner,
    initGuardians,
    encryptedSigner: AES.encrypt(
      signer.privateKey,
      Buffer.from(passwordKey).toString("hex")
    ).toString(),
  };
};

module.exports.isCodeDeployed = async (provider, walletAddress) => {
  const code = await provider.getCode(walletAddress);

  return code !== userOperation.nullCode;
};

module.exports.getAddress = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return ethers.utils.getCreate2Address(
    SingletonFactory.address,
    ethers.utils.formatBytes32String(userOperation.initNonce),
    ethers.utils.keccak256(
      this.getInitCode(
        initImplementation,
        initEntryPoint,
        initOwner,
        initGuardians
      )
    )
  );
};

module.exports.getInitCode = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return walletProxy.factory.getDeployTransaction(
    initImplementation,
    encodeFunctionData.initialize(initEntryPoint, initOwner, initGuardians)
  ).data;
};

module.exports.getNonce = async (provider, walletAddress) => {
  const w = Wallet.getInstance(provider).attach(walletAddress);
  return w.nonce().then((nonce) => nonce.toNumber());
};
