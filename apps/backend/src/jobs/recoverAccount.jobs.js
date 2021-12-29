const jobs = require('../config/jobs');
const logger = require('../config/logger');
const userService = require('../services/user.service');
const walletService = require('../services/wallet.service');
const signerService = require('../services/signer.service');
const pusherService = require('../services/pusher.service');
const { getTransactionStatus } = require('../utils/web3');
const { status } = require('../config/transaction');

const log = (msg) => logger.info(`JOB ${jobs.RECOVER_ACCOUNT}: ${msg}`);

const recoverAccount = (queue) => {
  queue.define(jobs.RECOVER_ACCOUNT, async (job) => {
    const { channelId, username, encryptedSigner, userOperations, transactionHash } = job.attrs.data;

    if (!transactionHash) {
      // TODO: Run additional verification before relaying?
      const tx = await signerService.relayUserOpsToEntryPoint(userOperations);
      log(`Forwarded user ops to EntryPoint in ${tx.hash}`);

      queue.now(jobs.RECOVER_ACCOUNT, { transactionHash: tx.hash, ...job.attrs.data });
      return;
    }

    const txStatus = await getTransactionStatus(transactionHash);
    if (txStatus === status.pending) {
      log(`Transaction ${transactionHash} still pending. Requeuing job`);
      queue.now(jobs.RECOVER_ACCOUNT, { ...job.attrs.data });
    } else {
      if (txStatus === status.success) {
        await userService
          .getUserByUsername(username)
          .then((user) => walletService.updateUserWallet(user.id, { encryptedSigner }));
      }

      pusherService.pushRecoverAccountStatus(channelId, { status: txStatus, transactionHash });
      log(`Transaction ${transactionHash} completed. Update pushed to channel.`);
    }
  });
};

module.exports = recoverAccount;
