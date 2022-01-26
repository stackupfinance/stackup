/* eslint-disable no-await-in-loop */
const httpStatus = require('http-status');
const { contracts, wallet } = require('@stackupfinance/contracts');
const ApiError = require('../utils/ApiError');
const { Transaction } = require('../models');
const queue = require('../queue');
const { functionSignatures, type: txType } = require('../config/transaction');
const { types } = require('../config/queue');
const { web3 } = require('../config/config');
const {
  getChainId,
  recoverAddressFromLoginSignature,
  getERC20TokenMeta,
  formatERC20Value,
  signatureCount,
} = require('../utils/web3');

module.exports.parseUserOperations = async (userOperations) => {
  let transaction = {};
  for (let i = 0; i < userOperations.length; i += 1) {
    const userOp = userOperations[i];
    const opcd = wallet.decodeCallData.fromUserOperation(userOp);
    const wcd =
      opcd.signature === functionSignatures.walletExecuteUserOp ? wallet.decodeCallData.fromExecuteUserOp(opcd) : opcd;

    let lineItem = {};
    let tokenMeta = {};
    let type = txType.genericRelay;
    switch (wcd.signature) {
      case functionSignatures.erc20Transfer:
        tokenMeta = await getERC20TokenMeta(opcd.args[0]);
        lineItem = {
          from: userOp.sender,
          to: wcd.args[0],
          value: wcd.args[1].toString(),
          units: tokenMeta.units,
          prefix: tokenMeta.prefix,
          suffix: tokenMeta.suffix,
        };
        type = txType.newPayment;
        break;

      case functionSignatures.erc20Approve:
        tokenMeta = await getERC20TokenMeta(opcd.args[0]);
        lineItem = {
          from: userOp.sender,
          to: wcd.args[0],
          sideEffect: `${lineItem.from} approved ${lineItem.to} for ${formatERC20Value(tokenMeta, wcd.args[1])}`,
        };
        break;

      case functionSignatures.walletGrantGuardian:
        lineItem = {
          from: userOp.sender,
          to: wcd.args[0],
          sideEffect: `${lineItem.from} added ${lineItem.to} as a guardian`,
        };
        break;

      case functionSignatures.walletRevokeGuardian:
        lineItem = {
          from: userOp.sender,
          to: wcd.args[0],
          sideEffect: `${lineItem.from} removed ${lineItem.to} as a guardian`,
        };
        break;

      case functionSignatures.walletTransferOwner:
        lineItem = {
          from: userOp.sender,
          sideEffect: `${lineItem.from} recovered account with ${signatureCount(userOp)} guardians`,
        };
        type = txType.recoverAccount;
        break;

      default:
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UserOperation');
    }

    if (i === 0) {
      transaction = {
        chainId: await getChainId(),
        ...lineItem,
        type,
        extraLineItems: [],
        fee: {
          ...(await getERC20TokenMeta(web3.usdc)),
        },
      };
    } else {
      transaction = {
        ...transaction,
        type,
        extraLineItems: [...transaction.extraLineItems, { ...lineItem }],
      };
    }
  }

  return transaction;
};

module.exports.getTransactionById = async (id) => {
  return Transaction.findById(id);
};

module.exports.createTransaction = async (transaction, message) => {
  return Transaction.create({
    message,
    ...transaction,
  });
};

module.exports.updateTransaction = async (doc, updates) => {
  Object.assign(doc, updates);
  return doc.save();
};

module.exports.verifyRecoverAccountUserOps = async (signature, userOps) => {
  const recoveredAddress = recoverAddressFromLoginSignature(signature);
  const newOwner = contracts.Wallet.interface.decodeFunctionData('transferOwner', userOps[userOps.length - 1].callData)[0];

  if (recoveredAddress !== newOwner) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UserOperation');
  }
};

module.exports.relayTransaction = async (data) => {
  queue.now(types.relayTransaction, data);
};

module.exports.queryActivity = async (walletAddress) => {
  return Transaction.aggregate()
    .match({
      $and: [
        { type: { $eq: txType.newPayment } },
        { $or: [{ from: { $eq: walletAddress } }, { to: { $eq: walletAddress } }] },
      ],
    })
    .sort('-updatedAt')
    .addFields({
      addresses: {
        $cond: {
          if: { $eq: [{ $strcasecmp: ['$from', '$to'] }, 1] },
          then: { $concat: ['$to', '-', '$from'] },
          else: { $concat: ['$from', '-', '$to'] },
        },
      },
      toAddress: {
        $cond: {
          if: { $eq: [walletAddress, '$from'] },
          then: '$to',
          else: '$from',
        },
      },
    })
    .group({
      _id: '$addresses',
      toAddress: { $first: '$toAddress' },
      preview: { $first: '$message' },
      updatedAt: { $first: '$updatedAt' },
    })
    .limit(20)
    .lookup({
      from: 'wallets',
      localField: 'toAddress',
      foreignField: 'walletAddress',
      as: 'toWallet',
    })
    .addFields({
      toWallet: { $arrayElemAt: ['$toWallet', 0] },
    })
    .lookup({
      from: 'users',
      localField: 'toWallet.user',
      foreignField: '_id',
      as: 'toUser',
    })
    .addFields({
      toUser: { $arrayElemAt: ['$toUser', 0] },
    })
    .project({
      _id: false,
      id: '$_id',
      toUser: { username: '$toUser.username', walletAddress: '$toWallet.walletAddress' },
      preview: true,
      updatedAt: true,
    });
};

module.exports.queryActivityItems = async (user, address1, address2, opts = { limit: 100, id: undefined }) => {
  return Transaction.aggregate()
    .match(
      opts.id
        ? { _id: { $eq: opts.id } }
        : {
            $and: [
              { type: { $eq: txType.newPayment } },
              {
                $or: [
                  { from: { $eq: address1 }, to: { $eq: address2 } },
                  { from: { $eq: address2 }, to: { $eq: address1 } },
                ],
              },
            ],
          }
    )
    .sort('-updatedAt')
    .limit(opts.limit)
    .addFields({
      isReceiving: {
        $cond: {
          if: { $eq: [user.wallet.walletAddress, '$to'] },
          then: true,
          else: false,
        },
      },
    })
    .lookup({
      from: 'wallets',
      localField: 'from',
      foreignField: 'walletAddress',
      as: 'fromWallet',
    })
    .lookup({
      from: 'wallets',
      localField: 'to',
      foreignField: 'walletAddress',
      as: 'toWallet',
    })
    .addFields({
      fromWallet: { $arrayElemAt: ['$fromWallet', 0] },
      toWallet: { $arrayElemAt: ['$toWallet', 0] },
    })
    .lookup({
      from: 'users',
      localField: 'fromWallet.user',
      foreignField: '_id',
      as: 'fromUser',
    })
    .lookup({
      from: 'users',
      localField: 'toWallet.user',
      foreignField: '_id',
      as: 'toUser',
    })
    .addFields({
      fromUser: { $arrayElemAt: ['$fromUser', 0] },
      toUser: { $arrayElemAt: ['$toUser', 0] },
    })
    .project({
      _id: false,
      id: '$_id',
      isReceiving: true,
      fromUser: { username: '$fromUser.username', walletAddress: '$fromWallet.walletAddress' },
      toUser: { username: '$toUser.username', walletAddress: '$toWallet.walletAddress' },
      value: true,
      units: true,
      prefix: true,
      suffix: true,
      message: true,
      status: true,
      updatedAt: true,
    });
};
