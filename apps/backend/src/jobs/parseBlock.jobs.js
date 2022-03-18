const httpStatus = require('http-status');
const logger = require('../config/logger');
const alchemyService = require('../services/alchemy.service');
const transactionService = require('../services/transaction.service');
const { types } = require('../config/queue');

const log = (msg) => logger.info(`JOB ${types.parseBlock}: ${msg}`);

const parseBlock = (queue) => {
  queue.define(types.parseBlock, async (job) => {
    const { chainId, blockNumber, attempt = 0 } = job.attrs.data;

    try {
      const data = await alchemyService.getTransactionReceipts(chainId, blockNumber);
      const receipts = data.result?.receipts;

      if (!receipts && attempt < 2) {
        queue.schedule('5 seconds', types.parseBlock, { ...job.attrs.data, attempt: attempt + 1 });
      } else if (!receipts) {
        throw new Error(`receipts not found: ${JSON.stringify(data)}`);
      } else {
        const transactions = transactionService.parseReceiptsForIncomingTransfers(chainId, receipts);
        await transactionService.indexIncomingTransfers(transactions);
        log(`blockNumber: ${blockNumber}, incomingTransfers: ${transactions.length}`);
      }
    } catch (error) {
      if (error.response?.status === httpStatus.BAD_GATEWAY) {
        queue.schedule('5 seconds', types.parseBlock, { ...job.attrs.data, attempt: attempt + 1 });
      } else {
        logger.error(error);
        throw error;
      }
    }
  });
};

module.exports = parseBlock;
