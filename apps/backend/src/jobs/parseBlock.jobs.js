const logger = require('../config/logger');
const alchemyService = require('../services/alchemy.service');
const transactionService = require('../services/transaction.service');
const { types } = require('../config/queue');

const log = (msg) => logger.info(`JOB ${types.parseBlock}: ${msg}`);

const parseBlock = (queue) => {
  queue.define(types.parseBlock, async (job) => {
    try {
      const { chainId, blockNumber } = job.attrs.data;
      const receipts = await alchemyService.getTransactionReceipts(chainId, blockNumber);
      const transactions = transactionService.parseReceiptsForIncomingTransfers(chainId, receipts);

      await transactionService.indexIncomingTransfers(transactions);
      log(`blockNumber: ${blockNumber}, incomingTransfers: ${transactions.length}`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  });
};

module.exports = parseBlock;
