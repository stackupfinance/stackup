const logger = require('../config/logger');
const signerService = require('../services/signer.service');
const pusherService = require('../services/pusher.service');
const { getTransactionStatus } = require('../utils/web3');
const { status } = require('../config/transaction');
const { types } = require('../config/events');

const log = (msg) => logger.info(`JOB ${types.genericRelay}: ${msg}`);

const genericRelay = (queue) => {
  queue.define(types.genericRelay, async (job) => {
    const { userId, userOperations, transactionHash } = job.attrs.data;

    if (!transactionHash) {
      // TODO: Run additional verification before relaying?
      const tx = await signerService.relayUserOpsToEntryPoint(userOperations);
      log(`Forwarded user ops to EntryPoint in ${tx.hash}`);

      queue.now(types.genericRelay, { ...job.attrs.data, transactionHash: tx.hash });
      return;
    }

    const txStatus = await getTransactionStatus(transactionHash);
    if (txStatus === status.pending) {
      log(`Transaction ${transactionHash} still pending. Requeuing job`);
      queue.now(types.genericRelay, { ...job.attrs.data });
    } else {
      pusherService.pushGenericRelayUpdates(userId, { status: txStatus, transactionHash });
      log(`Transaction ${transactionHash} completed. Update pushed to channel.`);
    }
  });
};

module.exports = genericRelay;
