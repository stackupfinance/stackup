/**
 * This file has some overlapping fuctions with
 * ./apps/contracts/utils/contractHelpers.js.
 *
 * These functions are commented with "Overlap code" for reference.
 *
 * TODO: Consider consolidating the two modules into a single package.
 */
const { ethers } = require('ethers');
const { web3 } = require('../config/config');
const { status } = require('../config/payments');
const { abi: ENTRY_POINT_ABI } = require('../config/contracts/EntryPoint.json');

// Overlap code
const PAYMASTER_FEE = ethers.BigNumber.from(100000);
// ------------

// These contracts have the same address on any chain.
const ENTRY_POINT_ADDRESS = '0x6dDAE1a8f3ff1B42907B2ef4b08C2A7fc16B0F25';
const PAYMASTER_ADDRESS = '0x2158d5f5d83a70cbba65fce7EdF4BB3A653A0310';

const provider = new ethers.providers.JsonRpcProvider(web3.rpc);
const signer = ethers.Wallet.fromMnemonic(web3.mnemonic).connect(provider);
const entryPointContract = new ethers.Contract(ENTRY_POINT_ADDRESS, ENTRY_POINT_ABI, provider);

// Overlap code
const getPaymasterDataHash = (op, paymasterFee, erc20Token, dataFeed) => {
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
        // Hash all paymasterData together
        ethers.utils.keccak256(
          ethers.utils.solidityPack(['uint256', 'address', 'address'], [paymasterFee, erc20Token, dataFeed])
        ),
      ]
    )
  );
  return ethers.utils.arrayify(messageHash);
};

// Overlap code (partial)
const withPaymaster = async (op, opts = {}) => {
  const userOp = {
    ...op,
    paymaster: PAYMASTER_ADDRESS,
  };
  const fee = typeof opts.fee !== 'undefined' ? opts.fee : PAYMASTER_FEE;

  return {
    ...userOp,
    paymasterData: ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'address', 'address', 'bytes'],
      [
        fee,
        web3.usdc,
        web3.usdcPriceFeed,
        await signer.signMessage(getPaymasterDataHash(userOp, fee, web3.usdc, web3.usdcPriceFeed)),
      ]
    ),
  };
};

const entryPointHandleOps = async (userOps) => {
  return entryPointContract.connect(signer).handleOps(userOps, signer.address, {
    gasLimit: 5000000,
  });
};

const getTransactionStatus = async (transactionHash) => {
  const txReceipt = await provider.getTransactionReceipt(transactionHash);
  if (!txReceipt) {
    return status.pending;
  }
  if (txReceipt.status === 1) {
    return status.success;
  }
  return status.failed;
};

module.exports = {
  withPaymaster,
  entryPointHandleOps,
  getTransactionStatus,
};
