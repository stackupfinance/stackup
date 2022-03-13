/* eslint-disable no-await-in-loop */
const httpStatus = require('http-status');
const { contracts, wallet } = require('@stackupfinance/contracts');
const ApiError = require('../utils/ApiError');
const { Transaction } = require('../models');
const queue = require('../queue');
const { functionSignatures, type: txType, status: txStatus } = require('../config/transaction');
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
    const wcd = wallet.decodeCallData.Erc20FromExecuteUserOp(opcd) ?? opcd;

    let lineItem = {};
    let type = txType.genericRelay;
    switch (wcd.signature) {
      case functionSignatures.walletExecuteUserOp: {
        const from = userOp.sender;
        const to = wcd.args[0];
        lineItem = {
          from,
          to,
          sideEffect: `${from} made a transaction to ${to}`,
        };
        break;
      }

      case functionSignatures.erc20Transfer: {
        const tokenMeta = await getERC20TokenMeta(opcd.args[0]);
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
      }

      case functionSignatures.erc20Approve: {
        const tokenMeta = await getERC20TokenMeta(opcd.args[0]);
        const from = userOp.sender;
        const to = wcd.args[0];
        lineItem = {
          from,
          to,
          sideEffect: `${from} approved ${to} to transact up to ${formatERC20Value(tokenMeta, wcd.args[1])}`,
        };
        break;
      }

      case functionSignatures.walletGrantGuardian: {
        const from = userOp.sender;
        const to = wcd.args[0];
        lineItem = {
          from,
          to,
          sideEffect: `${from} added ${to} as a guardian`,
        };
        break;
      }

      case functionSignatures.walletRevokeGuardian: {
        const from = userOp.sender;
        const to = wcd.args[0];
        lineItem = {
          from,
          to,
          sideEffect: `${from} removed ${to} as a guardian`,
        };
        break;
      }

      case functionSignatures.walletTransferOwner: {
        const from = userOp.sender;
        const sigCount = signatureCount(userOp);
        lineItem = {
          from,
          sideEffect: `${from} recovered account with ${sigCount} guardian${sigCount === 1 ? '' : 's'}`,
        };
        type = txType.recoverAccount;
        break;
      }

      default:
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UserOperation');
    }

    if (i === 0) {
      transaction = {
        chainId: await getChainId(),
        type,
        lineItems: [{ ...lineItem }],
        fee: {
          ...(await getERC20TokenMeta(web3.usdc)),
        },
      };
    } else {
      transaction = {
        ...transaction,
        type,
        lineItems: [...transaction.lineItems, { ...lineItem }],
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

module.exports.resolveNewPaymentTransferAddresses = (transaction) => {
  return transaction.lineItems.length > 1
    ? [transaction.lineItems[1].from, transaction.lineItems[1].to]
    : [transaction.lineItems[0].from, transaction.lineItems[0].to];
};

module.exports.queryActivity = async (walletAddress) => {
  return Transaction.aggregate()
    .match({
      $and: [
        { type: { $eq: txType.newPayment } },
        {
          $or: [
            { lineItems: { $elemMatch: { from: { $eq: walletAddress } } } },
            { lineItems: { $elemMatch: { to: { $eq: walletAddress } } } },
          ],
        },
      ],
    })
    .addFields({
      lastLineItem: { $last: '$lineItems' },
    })
    .addFields({
      addresses: {
        $cond: {
          if: { $eq: [{ $strcasecmp: ['$lastLineItem.from', '$lastLineItem.to'] }, 1] },
          then: { $concat: ['$lastLineItem.to', '-', '$lastLineItem.from'] },
          else: { $concat: ['$lastLineItem.from', '-', '$lastLineItem.to'] },
        },
      },
      toAddress: {
        $cond: {
          if: { $eq: [walletAddress, '$lastLineItem.from'] },
          then: '$lastLineItem.to',
          else: '$lastLineItem.from',
        },
      },
    })
    .group({
      _id: '$addresses',
      toAddress: { $last: '$toAddress' },
      preview: { $last: '$message' },
      updatedAt: { $last: '$updatedAt' },
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
      toUser: {
        username: {
          $ifNull: [
            '$toUser.username',
            { $concat: [{ $substrBytes: ['$toAddress', 0, 5] }, '...', { $substrBytes: ['$toAddress', 35, 5] }] },
          ],
        },
        walletAddress: { $ifNull: ['$toWallet.walletAddress', '$toAddress'] },
      },
      preview: true,
      updatedAt: true,
    })
    .sort('-updatedAt');
};

module.exports.queryActivityItems = async (user, address1, address2, opts = { limit: 100, id: undefined }) => {
  return Transaction.aggregate()
    .match(
      opts.id
        ? { _id: { $eq: opts.id } }
        : {
            $and: [
              { type: { $eq: txType.newPayment } },
              { lineItems: { $elemMatch: { from: { $in: [address1, address2] }, to: { $in: [address1, address2] } } } },
            ],
          }
    )
    .limit(opts.limit)
    .sort('-updatedAt')
    .addFields({
      lastLineItem: { $last: '$lineItems' },
    })
    .addFields({
      isReceiving: {
        $cond: {
          if: { $eq: [user.wallet.walletAddress, '$lastLineItem.to'] },
          then: true,
          else: false,
        },
      },
    })
    .lookup({
      from: 'wallets',
      localField: 'lastLineItem.from',
      foreignField: 'walletAddress',
      as: 'fromWallet',
    })
    .lookup({
      from: 'wallets',
      localField: 'lastLineItem.to',
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
      toUser: {
        username: {
          $ifNull: [
            '$toUser.username',
            {
              $concat: [{ $substrBytes: ['$lastLineItem.to', 0, 5] }, '...', { $substrBytes: ['$lastLineItem.to', 35, 5] }],
            },
          ],
        },
        walletAddress: { $ifNull: ['$toWallet.walletAddress', '$lastLineItem.to'] },
      },
      value: '$lastLineItem.value',
      units: '$lastLineItem.units',
      prefix: '$lastLineItem.prefix',
      suffix: '$lastLineItem.suffix',
      message: true,
      status: true,
      updatedAt: true,
    });
};

module.exports.queryHistory = async (user, opts = { limit: 100 }) => {
  return Transaction.aggregate()
    .match({
      $and: [
        { status: { $eq: txStatus.success } },
        {
          $or: [
            { lineItems: { $elemMatch: { from: { $eq: user.wallet.walletAddress } } } },
            { lineItems: { $elemMatch: { to: { $eq: user.wallet.walletAddress } } } },
          ],
        },
      ],
    })
    .limit(opts.limit)
    .sort('-updatedAt')
    .addFields({
      lineItems: {
        $filter: {
          input: '$lineItems',
          as: 'lineItem',
          cond: {
            $or: [
              { $eq: ['$$lineItem.from', user.wallet.walletAddress] },
              { $eq: ['$$lineItem.to', user.wallet.walletAddress] },
            ],
          },
        },
      },
    })
    .project({
      _id: false,
      status: true,
      hash: true,
      lineItems: {
        $map: {
          input: '$lineItems',
          as: 'lineItem',
          in: {
            from: '$$lineItem.from',
            to: '$$lineItem.to',
            value: '$$lineItem.value',
            units: '$$lineItem.units',
            prefix: '$$lineItem.prefix',
            suffix: '$$lineItem.suffix',
            sideEffect: '$$lineItem.sideEffect',
            isReceiving: {
              $cond: {
                if: { $eq: [user.wallet.walletAddress, '$$lineItem.to'] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
      fee: true,
      updatedAt: true,
    })
    .group({
      _id: { $dateToString: { format: '%d-%m-%Y', date: '$updatedAt' } },
      lastDate: { $last: '$updatedAt' },
      transactions: { $push: '$$ROOT' },
    })
    .sort('-lastDate')
    .project({ _id: false, lastDate: true, transactions: true });
};
