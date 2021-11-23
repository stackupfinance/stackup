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

// Overlap code
const PAYMASTER_FEE = ethers.BigNumber.from(100000);
// ------------

// These contracts have the same address on any chain.
const PAYMASTER_ADDRESS = '0xE156AaE544265f8B9498F5b9C686f170188A1529';

const signer = ethers.Wallet.fromMnemonic(web3.mnemonic);

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
const withPaymaster = async (op) => {
  const userOp = {
    ...op,
    paymaster: PAYMASTER_ADDRESS,
  };

  return {
    ...userOp,
    paymasterData: ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'address', 'address', 'bytes'],
      [
        PAYMASTER_FEE,
        web3.usdc,
        web3.usdcPriceFeed,
        await signer.signMessage(getPaymasterDataHash(userOp, PAYMASTER_FEE, web3.usdc, web3.usdcPriceFeed)),
      ]
    ),
  };
};

module.exports = {
  withPaymaster,
};
