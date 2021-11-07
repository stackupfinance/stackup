const { ethers, network } = require("hardhat");
const TestContract = require("../artifacts/contracts/test/Test.sol/Test.json");
const EntryPointContract = require("../artifacts/contracts/ERC4337/EntryPoint.sol/EntryPoint.json");
const WalletContract = require("../artifacts/contracts/ERC4337/Wallet.sol/Wallet.json");
const UniswapV2Router02 = require("../artifacts/contracts/uniswap/IUniswapV2Router02.sol/IUniswapV2Router02.json");

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
const ENTRY_POINT_CONTRACT_INTERFACE = new ethers.utils.Interface(
  EntryPointContract.abi
);
const WALLET_CONTRACT_INTERFACE = new ethers.utils.Interface(
  WalletContract.abi
);
const ERC20_INTERFACE = new ethers.utils.Interface([
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
]);

const LOCK_EXPIRY_PERIOD = 172800; // 2 Days

const PAYMASTER_FEE = ethers.BigNumber.from(100000);
const USDC_TOKEN = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const MATIC_USD_DATA_FEED = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";

const WETH = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
const UNISWAP_V2 = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const UNISWAP_V2_ROUTER_O2 = new ethers.Contract(
  UNISWAP_V2,
  UniswapV2Router02.abi,
  ethers.provider
);

const MOCK_POST_OP_ACTUAL_GAS = ethers.utils.parseEther("0.0005");
const MOCK_POST_OP_EXCHANGE_RATE = ethers.BigNumber.from("1847619");

const encodeAddStake = (entryPoint, value) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("executeUserOp", [
    entryPoint,
    value._isBigNumber ? value : ethers.utils.parseEther(value),
    ENTRY_POINT_CONTRACT_INTERFACE.encodeFunctionData("addStake"),
  ]);
};

const encodeLockStake = (entryPoint) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("executeUserOp", [
    entryPoint,
    0,
    ENTRY_POINT_CONTRACT_INTERFACE.encodeFunctionData("lockStake"),
  ]);
};

const encodeERC20MaxApprove = (spender) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("executeUserOp", [
    USDC_TOKEN,
    0,
    ERC20_INTERFACE.encodeFunctionData("approve", [
      spender,
      ethers.constants.MaxUint256,
    ]),
  ]);
};

const encodeERC20ZeroApprove = (spender) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("executeUserOp", [
    USDC_TOKEN,
    0,
    ERC20_INTERFACE.encodeFunctionData("approve", [
      spender,
      ethers.constants.Zero,
    ]),
  ]);
};

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

const getContractAddress = (create2factory, initCode) => {
  return ethers.utils.getCreate2Address(
    create2factory,
    ethers.utils.formatBytes32String(INITIAL_NONCE),
    ethers.utils.keccak256(initCode)
  );
};

const getPaymasterDataHash = (op, paymasterFee, erc20Token, dataFeed) => {
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
        // Hash all paymasterData together
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ["uint256", "address", "address"],
            [paymasterFee, erc20Token, dataFeed]
          )
        ),
      ]
    )
  );
  return ethers.utils.arrayify(messageHash);
};

const getTokenAllowance = async (owner, spender, token) => {
  const erc20Token = new ethers.Contract(
    token,
    ERC20_INTERFACE,
    ethers.provider
  );

  return erc20Token.allowance(owner, spender);
};

const getTokenBalance = async (owner, token) => {
  const erc20Token = new ethers.Contract(
    token,
    ERC20_INTERFACE,
    ethers.provider
  );

  return erc20Token.balanceOf(owner);
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

const getUserOperation = (sender, override = {}) => {
  return {
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
    signature: NULL_DATA,
    ...override,
  };
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

const mockPostOpArgs = (sender) => {
  return [
    0,
    ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256", "uint256"],
      [sender, USDC_TOKEN, MOCK_POST_OP_EXCHANGE_RATE, PAYMASTER_FEE]
    ),
    MOCK_POST_OP_ACTUAL_GAS,
  ];
};

const sendEth = async (from, to, value) => {
  return from.sendTransaction({
    to,
    value: value._isBigNumber ? value : ethers.utils.parseEther(value),
  });
};

const signUserOperation = async (signer, op) => {
  return {
    ...op,
    signature: await signer.signMessage(getUserOperationHash(op)),
  };
};

const swapEthForToken = async (signer, to, token, value) => {
  const path = [WETH, token];
  const amountsOut = await UNISWAP_V2_ROUTER_O2.connect(signer).getAmountsOut(
    value,
    path
  );
  const amountOutMin = amountsOut[1]
    .mul(ethers.BigNumber.from("9950"))
    .div(ethers.BigNumber.from("10000")); //0.5% slippage

  return UNISWAP_V2_ROUTER_O2.connect(signer).swapExactETHForTokens(
    amountOutMin,
    path,
    to,
    (await getLastBlockTimestamp()) + 300,
    { value }
  );
};

const transactionFee = (tx) => {
  return tx.effectiveGasPrice.mul(tx.gasUsed);
};

const withPaymaster = async (signer, paymaster, op) => {
  const userOp = {
    ...op,
    paymaster,
  };

  return {
    ...userOp,
    paymasterData: ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "bytes"],
      [
        PAYMASTER_FEE,
        USDC_TOKEN,
        MATIC_USD_DATA_FEED,
        await signer.signMessage(
          getPaymasterDataHash(
            userOp,
            PAYMASTER_FEE,
            USDC_TOKEN,
            MATIC_USD_DATA_FEED
          )
        ),
      ]
    ),
  };
};

module.exports = {
  DEFAULT_REQUIRED_PRE_FUND,
  INITIAL_NONCE,
  LOCK_EXPIRY_PERIOD,
  MOCK_POST_OP_ACTUAL_GAS,
  MOCK_POST_OP_EXCHANGE_RATE,
  NULL_DATA,
  PAYMASTER_FEE,
  TEST_CONTRACT_INTERFACE,
  USDC_TOKEN,
  encodeAddStake,
  encodeLockStake,
  encodeERC20MaxApprove,
  encodeERC20ZeroApprove,
  encodeFailContractCall,
  encodeFailEntryPointCall,
  encodePassContractCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getContractAddress,
  getTokenAllowance,
  getTokenBalance,
  getUserOperationHash,
  getUserOperation,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  isWalletDeployed,
  mockPostOpArgs,
  sendEth,
  signUserOperation,
  swapEthForToken,
  transactionFee,
  withPaymaster,
};
