const httpStatus = require('http-status');
const logger = require('../config/logger');
const alchemyService = require('../services/alchemy.service');
const transactionService = require('../services/transaction.service');
const { types } = require('../config/queue');

const MAX_ATTEMPTS = 3;
const exponentialBackoffDelay = (attempt) => {
  return `${5 * 2 ** attempt} seconds`;
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
        (error.response?.status === httpStatus.BAD_GATEWAY || error.response?.status === httpStatus.SERVICE_UNAVAILABLE) &&
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
