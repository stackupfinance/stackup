const { ethers } = require("ethers");
const EntryPoint = require("../contracts/entryPoint");
const userOperations = require("../constants/userOperations");
const message = require("./message");

module.exports.appendGuardianSignature = (userOp, signedUserOp) => {
  const ws1 =
    userOp.signature !== userOperations.nullCode
      ? ethers.utils.defaultAbiCoder.decode(
          ["uint8", "(address signer, bytes signature)[]"],
          userOp.signature
        )
      : [undefined, []];
  const ws2 = ethers.utils.defaultAbiCoder.decode(
    ["uint8", "(address signer, bytes signature)[]"],
    signedUserOp.signature
  );
  const signatureSet = new Set([]);
  const walletSignatureValues = [
    ...ws1[1].map((v) => ({ signer: v.signer, signature: v.signature })),
    ...ws2[1].map((v) => ({ signer: v.signer, signature: v.signature })),
  ].filter((v) => {
    if (signatureSet.has(v.signer)) return false;

    signatureSet.add(v.signer);
    return true;
  });

  return {
    ...userOp,
    signature: ethers.utils.defaultAbiCoder.encode(
      ["uint8", "(address signer, bytes signature)[]"],
      [1, walletSignatureValues]
    ),
  };
};

module.exports.get = (sender, override = {}) => {
  return {
    sender,
    ...userOperations.defaults,
    ...override,
  };
};

module.exports.sign = async (signer, op) => {
  const walletSignatureValues = [
    {
      signer: signer.address,
      signature: await signer.signMessage(
        ethers.utils.arrayify(
          message.requestId(
            op,
            EntryPoint.address,
            await signer.provider.getNetwork().then((n) => n.chainId)
          )
        )
      ),
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
      signature: await signer.signMessage(
        ethers.utils.arrayify(
          message.requestId(
            op,
            EntryPoint.address,
            await signer.provider.getNetwork().then((n) => n.chainId)
          )
        )
      ),
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
