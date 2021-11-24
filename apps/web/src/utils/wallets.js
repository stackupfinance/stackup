/**
 * This file has some overlapping fuctions with
 * ./apps/contracts/utils/contractHelpers.js.
 *
 * These functions are commented with "Overlap code" for reference.
 *
 * TODO: Consider consolidating the two modules into a single package.
 */
import EthCrypto from 'eth-crypto';
import { ethers } from 'ethers';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { Web3 } from '../config';

// Overlap code
const NULL_DATA = '0x';
const INITIAL_NONCE = 0;
const DEFAULT_GAS = 100000;
const DEFAULT_MAX_FEE = 50000000000;
const DEFAULT_MAX_PRIORITY_FEE = DEFAULT_MAX_FEE;
const WALLET_CONTRACT_INTERFACE = new ethers.utils.Interface(Web3.WALLET_ABI);
const ERC20_INTERFACE = new ethers.utils.Interface(Web3.ERC20_ABI);
// ------------

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// TODO: Make this more precise.
// Approving the paymaster for $10 should be more than enough to cover tx fees.
// If approval drops below $5 we approve again.
export const defaultPaymasterApproval = ethers.utils.parseUnits('10', Web3.USDC_UNITS);
export const defaultPaymasterReapproval = ethers.utils.parseUnits('5', Web3.USDC_UNITS);

export const provider = new ethers.providers.JsonRpcProvider(Web3.RPC);

export const usdcContract = new ethers.Contract(Web3.USDC, Web3.ERC20_ABI, provider);

export const getInitCode = (initSignerAddress) => {
  const Wallet = new ethers.ContractFactory(Web3.WALLET_ABI, Web3.WALLET_BYTECODE);
  return Wallet.getDeployTransaction(Web3.ENTRY_POINT_ADDRESS, initSignerAddress).data;
};

export const initWallet = (password) => {
  const signer = EthCrypto.createIdentity();
  const initCode = getInitCode(signer.address);

  return {
    walletAddress: ethers.utils.getCreate2Address(
      Web3.SINGLETON_FACTORY_ADDRESS,
      ethers.utils.formatBytes32String(Web3.INITIAL_NONCE),
      ethers.utils.keccak256(initCode),
    ),
    initSignerAddress: signer.address,
    encryptedSigner: AES.encrypt(signer.privateKey, password).toString(),
  };
};

export const getSigner = (wallet, password) => {
  try {
    const privateKey = AES.decrypt(wallet.encryptedSigner, password).toString(Utf8);
    if (!privateKey) return;

    return new ethers.Wallet(privateKey);
  } catch (error) {
    console.error(error);
  }
};

export const balanceToString = (balance = ethers.constants.Zero) => {
  return balance._isBigNumber
    ? ethers.utils.formatUnits(balance, Web3.USDC_UNITS)
    : ethers.utils.formatUnits(ethers.BigNumber.from(balance), Web3.USDC_UNITS);
};

export const displayUSDC = (balance) => {
  return formatter.format(balanceToString(balance));
};

export const getWalletNonce = async (address) => {
  const wallet = new ethers.Contract(address, Web3.WALLET_ABI, provider);
  return wallet.nonce().then((nonce) => nonce.toNumber());
};

// Overlap code
export const isWalletDeployed = async (address) => {
  const code = await provider.getCode(address);

  return code !== NULL_DATA;
};

// Overlap code
export const getUserOperation = (sender, override = {}) => {
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

// Overlap code
const getUserOperationHash = (op) => {
  const messageHash = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'bytes32',
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
      ],
    ),
  );
  return ethers.utils.arrayify(messageHash);
};

// Overlap code
export const signUserOperation = async (signer, op) => {
  return {
    ...op,
    signature: await signer.signMessage(getUserOperationHash(op)),
  };
};

// Overlap code (Partial)
export const encodeERC20Approve = (spender, value) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData('executeUserOp', [
    Web3.USDC,
    0,
    ERC20_INTERFACE.encodeFunctionData('approve', [spender, value]),
  ]);
};

// Overlap code
export const encodeERC20Transfer = (to, value) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData('executeUserOp', [
    Web3.USDC,
    0,
    ERC20_INTERFACE.encodeFunctionData('transfer', [to, value]),
  ]);
};
