const { ethers, network } = require("hardhat");
const TestContract = require("../artifacts/contracts/test/Test.sol/Test.json");
const UniswapV2Router02 = require("../artifacts/contracts/uniswap/IUniswapV2Router02.sol/IUniswapV2Router02.json");
const { contracts, constants } = require("../lib");

const TEST_CONTRACT_INTERFACE = new ethers.utils.Interface(TestContract.abi);
const UNISWAP_V2 = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const UNISWAP_V2_ROUTER_O2 = new ethers.Contract(
  UNISWAP_V2,
  UniswapV2Router02.abi,
  ethers.provider
);
const WETH = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";

const DEFAULT_REQUIRED_PRE_FUND = ethers.BigNumber.from(
  constants.userOperations.defaultGas * 3
).mul(ethers.BigNumber.from(constants.userOperations.defaultMaxFee));
const PAYMASTER_FEE = ethers.BigNumber.from(100000);
const PAYMASTER_LOCK_EXPIRY_PERIOD = 172800; // 2 Days
const USDC_DECIMALS = ethers.BigNumber.from(6);
const USDC_PRICE_FEED = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
const USDC_TOKEN = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const PAYMASTER_OPTS = [PAYMASTER_FEE, USDC_TOKEN, USDC_PRICE_FEED];
const PAYMASTER_OPTS_NO_FEE = [0, USDC_TOKEN, USDC_PRICE_FEED];

const MOCK_POST_OP_ACTUAL_GAS = ethers.utils.parseEther("0.0005");
const MOCK_POST_OP_EXCHANGE_RATE = ethers.BigNumber.from("1847619");
const MOCK_POST_OP_TOKEN_FEE = MOCK_POST_OP_ACTUAL_GAS.mul(
  MOCK_POST_OP_EXCHANGE_RATE
)
  .mul(ethers.BigNumber.from("10").pow(USDC_DECIMALS))
  .div(
    ethers.constants.WeiPerEther.mul(
      ethers.BigNumber.from("10").pow(USDC_DECIMALS)
    )
  )
  .add(PAYMASTER_FEE);

const encodeFailContractCall = () => {
  return TEST_CONTRACT_INTERFACE.encodeFunctionData("func", [false]);
};

const encodeFailEntryPointCall = (testContract) => {
  return contracts.Wallet.interface.encodeFunctionData("executeUserOp", [
    testContract,
    0,
    encodeFailContractCall(),
  ]);
};

const encodePassContractCall = () => {
  return TEST_CONTRACT_INTERFACE.encodeFunctionData("func", [true]);
};

const encodePassEntryPointCall = (testContract) => {
  return contracts.Wallet.interface.encodeFunctionData("executeUserOp", [
    testContract,
    0,
    encodePassContractCall(),
  ]);
};

const getAddressBalances = async (addresses) => {
  return Promise.all(addresses.map((addr) => ethers.provider.getBalance(addr)));
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

module.exports = {
  DEFAULT_REQUIRED_PRE_FUND,
  MOCK_POST_OP_TOKEN_FEE,
  PAYMASTER_FEE,
  PAYMASTER_LOCK_EXPIRY_PERIOD,
  PAYMASTER_OPTS,
  PAYMASTER_OPTS_NO_FEE,
  USDC_TOKEN,
  encodeFailContractCall,
  encodeFailEntryPointCall,
  encodePassContractCall,
  encodePassEntryPointCall,
  getAddressBalances,
  getLastBlockTimestamp,
  incrementBlockTimestamp,
  mockPostOpArgs,
  sendEth,
  swapEthForToken,
  transactionFee,
};
