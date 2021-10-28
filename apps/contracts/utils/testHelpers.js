const { ethers, network } = require("hardhat");
const TestContract = require("../artifacts/contracts/test/Test.sol/Test.json");
const WalletContract = require("../artifacts/contracts/ERC4337/Wallet.sol/Wallet.json");

const NULL_DATA = "0x";
const INITIAL_NONCE = 0;
const DEFAULT_GAS = 100000;

// For a standard EIP-1559 transaction:
// maxPriorityFee is by default 2 GWei
// maxFee = (2 * block.basefee) + maxPriorityFee
// gasFee = min(maxFee, maxPriorityFee + block.basefee)
//
// L2s and side-chains however, don't support EIP-1559 transactions
// Since we are building on L2, we will need to use legacy transactions
// Setting maxPriorityFee to equal maxFee will avoid call to BASEFEE
const DEFAULT_MAX_FEE = 50000000000;
const DEFAULT_MAX_PRIORITY_FEE = DEFAULT_MAX_FEE;

const DEFAULT_REQUIRED_PRE_FUND = ethers.BigNumber.from(DEFAULT_GAS * 3).mul(
  ethers.BigNumber.from(DEFAULT_MAX_FEE)
);

const TEST_CONTRACT_INTERFACE = new ethers.utils.Interface(TestContract.abi);
const WALLET_CONTRACT_INTERFACE = new ethers.utils.Interface(
  WalletContract.abi
);

const LOCK_EXPIRY_PERIOD = 172800; // 2 Days

const encodeFailContractCall = () => {
  return TEST_CONTRACT_INTERFACE.encodeFunctionData("func", [false]);
};

const encodeFailEntryPointCall = (testContract) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("executeUserOp", [
    testContract,
    0,
    encodeFailContractCall(),
  ]);
};

const encodePassContractCall = () => {
  return TEST_CONTRACT_INTERFACE.encodeFunctionData("func", [true]);
};

const encodePassEntryPointCall = (testContract) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("executeUserOp", [
    testContract,
    0,
    encodePassContractCall(),
  ]);
};

const getAddressBalances = async (addresses) => {
  return Promise.all(addresses.map((addr) => ethers.provider.getBalance(addr)));
};

const getUserOperationHash = (op) => {
  const messageHash = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "bytes32",
      ],
      [
        op.sender,
        op.nonce,
        ethers.utils.keccak256(op.initCode),
        ethers.utils.keccak256(op.callData),
        op.callGas,
        op.verificationGas,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymaster,
        ethers.utils.keccak256(op.paymasterData),
      ]
    )
  );
  return ethers.utils.arrayify(messageHash);
};

const getUserOperation = async (signer, sender, override = {}) => {
  const op = {
    sender,
    nonce: INITIAL_NONCE,
    initCode: NULL_DATA,
    callData: NULL_DATA,
    callGas: DEFAULT_GAS,
    verificationGas: DEFAULT_GAS,
    preVerificationGas: DEFAULT_GAS,
    maxFeePerGas: DEFAULT_MAX_FEE,
    maxPriorityFeePerGas: DEFAULT_MAX_PRIORITY_FEE,
    paymaster: ethers.constants.AddressZero,
    paymasterData: NULL_DATA,
    ...override,
  };

  return {
    ...op,
    signature: await signer.signMessage(getUserOperationHash(op)),
  };
};

const getWalletAddress = (create2factory, initCode) => {
  return ethers.utils.getCreate2Address(
    create2factory,
    ethers.utils.formatBytes32String(INITIAL_NONCE),
    ethers.utils.keccak256(initCode)
  );
};

const getLastBlockTimestamp = async () => {
  const prevBlock = await ethers.provider.getBlock(
    await ethers.provider.getBlockNumber()
  );

  return prevBlock.timestamp;
};

const incrementBlockTimestamp = async (increment = 0) => {
  await network.provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [(await getLastBlockTimestamp()) + increment],
  });
};

const isWalletDeployed = async (address) => {
  const code = await ethers.provider.getCode(address);

  return code !== NULL_DATA;
};

const sendEth = async (from, to, value) => {
  return from.sendTransaction({
    to,
    value: value._isBigNumber ? value : ethers.utils.parseEther(value),
  });
};

const transactionFee = (tx) => {
  return tx.effectiveGasPrice.mul(tx.gasUsed);
};

module.exports = {
  NULL_DATA,
  INITIAL_NONCE,
  DEFAULT_REQUIRED_PRE_FUND,
  TEST_CONTRACT_INTERFACE,
  LOCK_EXPIRY_PERIOD,
  encodeFailContractCall,
  encodeFailEntryPointCall,
  encodePassContractCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getUserOperationHash,
  getUserOperation,
  getWalletAddress,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  isWalletDeployed,
  sendEth,
  transactionFee,
};
