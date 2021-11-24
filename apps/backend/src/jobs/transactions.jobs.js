const jobs = require('../config/jobs');
const logger = require('../config/logger');
const signerService = require('../services/signer.service');
const paymentService = require('../services/payment.service');
const pusherService = require('../services/pusher.service');
const { getTransactionStatus } = require('../utils/web3');
const { status } = require('../config/payments');

const log = (msg) => logger.info(`JOB ${jobs.NEW_PAYMENT}: ${msg}`);

const transactions = (queue) => {
  queue.define(jobs.NEW_PAYMENT, async (job) => {
    const { paymentId, userOperations } = job.attrs.data;
    const payment = await paymentService.getPaymentById(paymentId);

    if (payment.status === status.pending && !payment.transactionHash) {
      // TODO: Run additional verification before relaying?
      const tx = await signerService.relayUserOpsToEntryPoint(userOperations);
      await paymentService.updatePaymentDoc(payment, { transactionHash: tx.hash });
      log(`Forwarded user ops to EntryPoint in ${tx.hash}`);

      queue.now(jobs.NEW_PAYMENT, { paymentId });
    } else if (payment.status === status.pending && payment.transactionHash) {
      const txStatus = await getTransactionStatus(payment.transactionHash);

      if (txStatus === status.pending) {
        log(`Transaction ${payment.transactionHash} still pending. Requeuing job`);
        queue.now(jobs.NEW_PAYMENT, { paymentId });
      } else {
        const updatedPayment = await paymentService.updatePaymentDoc(payment, { status: txStatus });
        pusherService.pushNewPaymentUpdate(updatedPayment);
        log(`Transaction ${payment.transactionHash} completed. Payment updated`);
      }
    }
  });
};

module.exports = transactions;
