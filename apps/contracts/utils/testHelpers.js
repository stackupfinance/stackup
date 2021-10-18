const { ethers } = require("hardhat");

const NULL_CODE = "0x";
const INITIAL_NONCE = 0;

const getUserOperationHash = (nonce) => {
  const messageHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["uint256"], [nonce])
  );
  return ethers.utils.arrayify(messageHash);
};

const getUserOperation = async (signer, sender, override = {}) => {
  return {
    sender,
    nonce: INITIAL_NONCE,
    initCode: NULL_CODE,
    signature: await signer.signMessage(
      getUserOperationHash(override.nonce ?? INITIAL_NONCE)
    ),
    ...override,
  };
};

const getWalletAddress = (create2factory, initCode) => {
  return ethers.utils.getCreate2Address(
    create2factory,
    ethers.utils.formatBytes32String(INITIAL_NONCE),
    ethers.utils.keccak256(initCode)
  );
};

const getWalletBalances = async (addresses) => {
  const [signer] = await ethers.getSigners();
  return Promise.all(addresses.map((addr) => signer.provider.getBalance(addr)));
};

const isWalletDeployed = async (address) => {
  const [signer] = await ethers.getSigners();
  const code = await signer.provider.getCode(address);

  return code !== NULL_CODE;
};

const sendEth = async (from, to, value) => {
  return from.sendTransaction({
    to,
    value: ethers.utils.parseEther(value),
  });
};

const transactionFee = (tx) => {
  return tx.effectiveGasPrice.mul(tx.gasUsed);
};

module.exports = {
  NULL_CODE,
  INITIAL_NONCE,
  getUserOperationHash,
  getUserOperation,
  getWalletAddress,
  getWalletBalances,
  isWalletDeployed,
  sendEth,
  transactionFee,
};
