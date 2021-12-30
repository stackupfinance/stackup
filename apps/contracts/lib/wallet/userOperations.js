const { ethers } = require("ethers");
const userOperations = require("../constants/userOperations");
const message = require("./message");

module.exports.get = (sender, override = {}) => {
  return {
    sender,
    nonce: userOperations.initNonce,
    initCode: userOperations.nullCode,
    callData: userOperations.nullCode,
    callGas: userOperations.defaultGas,
    verificationGas: userOperations.defaultGas,
    preVerificationGas: userOperations.defaultGas,
    maxFeePerGas: userOperations.defaultMaxFee,
    maxPriorityFeePerGas: userOperations.defaultMaxPriorityFee,
    paymaster: ethers.constants.AddressZero,
    paymasterData: userOperations.nullCode,
    signature: userOperations.nullCode,
    ...override,
  };
};

module.exports.sign = async (signer, op) => {
  const walletSignatureValues = [
    {
      signer: signer.address,
      signature: await signer.signMessage(message.userOperation(op)),
    },
  ];

  return {
    ...op,
    signature: ethers.utils.defaultAbiCoder.encode(
      ["uint8", "(address signer, bytes signature)[]"],
      [0, walletSignatureValues]
    ),
  };
};

module.exports.signAsGuardian = async (signer, guardian, op) => {
  const ws =
    op.signature !== userOperations.nullCode
      ? ethers.utils.defaultAbiCoder.decode(
          ["uint8", "(address signer, bytes signature)[]"],
          op.signature
        )
      : [undefined, []];

  const walletSignatureValues = [
    ...ws[1].map((v) => ({ signer: v.signer, signature: v.signature })),
    {
      signer: guardian,
      signature: await signer.signMessage(message.userOperation(op)),
    },
  ];

  return {
    ...op,
    signature: ethers.utils.defaultAbiCoder.encode(
      ["uint8", "(address signer, bytes signature)[]"],
      [1, walletSignatureValues]
    ),
  };
};

module.exports.signPaymasterData = async (
  signer,
  paymaster,
  fee,
  token,
  priceFeed,
  op
) => {
  const userOp = { ...op, paymaster };

  return {
    ...userOp,
    paymasterData: ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "bytes"],
      [
        fee,
        token,
        priceFeed,
        await signer.signMessage(
          message.paymasterData(userOp, fee, token, priceFeed)
        ),
      ]
    ),
  };
};
