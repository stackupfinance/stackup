const logger = require('../config/logger');
const transactionService = require('../services/transaction.service');
const signerService = require('../services/signer.service');
const userService = require('../services/user.service');
const walletService = require('../services/wallet.service');
const pusherService = require('../services/pusher.service');
const { getTransactionReceipt, getTransactionStatus, withTokenFeeValue } = require('../utils/web3');
const { status, type: txType } = require('../config/transaction');
const { types } = require('../config/queue');

const log = (msg) => logger.info(`JOB ${types.relayTransaction}: ${msg}`);

const postTransaction = async (userId, transaction, context = {}) => {
  switch (transaction.type) {
    case txType.newPayment: {
      const [u1, u2] = await userService.getUsersByWalletAddressAndPopulate(
        transactionService.resolveNewPaymentTransferAddresses(transaction),
        {
          withUserId: true,
        }
      );
      const [ai1, ai2] = await Promise.all([
        transactionService.queryActivityItems(u1, '', '', { limit: 1, id: transaction._id }).then((r) => r[0]),
        transactionService.queryActivityItems(u2, '', '', { limit: 1, id: transaction._id }).then((r) => r[0]),
      ]);
      await Promise.all([pusherService.pushNewPaymentUpdate(u1._id, ai1), pusherService.pushNewPaymentUpdate(u2._id, ai2)]);
      break;
    }

    case txType.genericRelay: {
      await pusherService.pushGenericRelayUpdates(userId, { status: transaction.status, transactionHash: transaction.hash });
      break;
    }

    case txType.recoverAccount: {
      if (transaction.status === status.success) {
        await userService
          .getUserByUsername(context.username)
          .then((user) => walletService.updateUserWallet(user.id, { encryptedSigner: context.encryptedSigner }));
      }
      await pusherService.pushRecoverAccountUpdates(context.channelId, {
        status: transaction.status,
        transactionHash: transaction.hash,
      });
      break;
    }

    default: {
      break;
    }
  }
};

const relayTransaction = (queue) => {
  queue.define(types.relayTransaction, async (job) => {
    const { userId, transactionId, userOperations, context } = job.attrs.data;
    const transaction = await transactionService.getTransactionById(transactionId);

    if (transaction.status === status.pending && !transaction.hash) {
      // TODO: Run additional verification before relaying?
      const tx = await signerService.relayUserOpsToEntryPoint(userOperations);
      await transactionService.updateTransaction(transaction, { hash: tx.hash });
      log(`Forwarded user ops to EntryPoint in ${tx.hash}`);

      queue.now(types.relayTransaction, job.attrs.data);
    } else if (transaction.status === status.pending && transaction.hash) {
      const txReceipt = await getTransactionReceipt(transaction.hash);
      const txStatus = getTransactionStatus(txReceipt);

      if (txStatus === status.pending) {
        log(`Transaction ${transaction.hash} still pending. Requeuing job`);
        queue.now(types.relayTransaction, job.attrs.data);
      } else {
        const updatedTransaction = await transactionService.updateTransaction(transaction, {
          status: txStatus,
          fee: withTokenFeeValue(txReceipt, transaction.fee),
        });
        await postTransaction(userId, updatedTransaction, context);

        log(`Transaction ${updatedTransaction.hash} completed. Transaction index updated`);
      }
    }
  });
};

module.exports = relayTransaction;
