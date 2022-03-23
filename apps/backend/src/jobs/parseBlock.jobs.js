const httpStatus = require('http-status');
const logger = require('../config/logger');
const alchemyService = require('../services/alchemy.service');
const transactionService = require('../services/transaction.service');
const { types } = require('../config/queue');

const MAX_ATTEMPTS = 10;
const MAX_DELAY = 600;
const BASE_DELAY = 5;
const exponentialBackoffDelay = (attempt) => {
  // This function returns a delay value that starts at $BASE_DELAY seconds
  // and exponentially increases to a cap of $MAX_DELAY seconds with full jitter.
  return `${Math.round(Math.random() * Math.min(MAX_DELAY, BASE_DELAY * 2 ** attempt))} seconds`;
};
const log = (msg) => logger.info(`JOB ${types.parseBlock}: ${msg}`);

const parseBlock = (queue) => {
  queue.define(types.parseBlock, async (job) => {
    const { chainId, blockNumber, attempt = 0 } = job.attrs.data;

    try {
      const data = await alchemyService.getTransactionReceipts(chainId, blockNumber);
      const receipts = data.result?.receipts;

      if (!receipts && attempt < MAX_ATTEMPTS) {
        queue.schedule(exponentialBackoffDelay(attempt), types.parseBlock, { ...job.attrs.data, attempt: attempt + 1 });
      } else if (!receipts) {
        throw new Error(`receipts not found: ${JSON.stringify(data)}`);
      } else {
        const transactions = transactionService.parseReceiptsForIncomingTransfers(chainId, receipts);
        await transactionService.indexIncomingTransfers(transactions);
        log(`blockNumber: ${blockNumber}, incomingTransfers: ${transactions.length}`);
      }
    } catch (error) {
      if (
        (httpStatus[`${error.response?.status}_CLASS`] === httpStatus.classes.CLIENT_ERROR ||
          httpStatus[`${error.response?.status}_CLASS`] === httpStatus.classes.SERVER_ERROR) &&
        attempt < MAX_ATTEMPTS
      ) {
        queue.schedule(exponentialBackoffDelay(attempt), types.parseBlock, { ...job.attrs.data, attempt: attempt + 1 });
      } else {
        logger.error(error);
        throw error;
      }
    }
  });
};

module.exports = parseBlock;
