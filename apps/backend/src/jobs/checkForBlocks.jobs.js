const logger = require('../config/logger');
const alchemyService = require('../services/alchemy.service');
const checkpointService = require('../services/checkpoint.service');
const { alchemy } = require('../config/config');
const { types } = require('../config/queue');

const log = (msg) => logger.info(`JOB ${types.checkForBlocks}: ${msg}`);

const checkForBlocks = (queue) => {
  queue.define(types.checkForBlocks, async (job) => {
    if (!alchemy.appUrl) {
      throw new Error('Alchemy app url not provided.');
    }

    const { chainId } = job.attrs.data;
    const [blockNumber, checkpoint] = await Promise.all([
      alchemyService.getBlockNumber(chainId),
      checkpointService.getCheckpointByChainId(chainId),
    ]);

    if (!checkpoint) {
      queue.now(types.parseBlock, { chainId, blockNumber });
    } else {
      for (let i = checkpoint.lastBlockNumber + 1; i <= blockNumber; i += 1) {
        queue.now(types.parseBlock, { chainId, blockNumber: i });
      }
    }

    await checkpointService.updateCheckpointByChainId(chainId, blockNumber);
    log(`chainId: ${chainId}, lastBlockNumber: ${blockNumber}`);
  });
};

module.exports = checkForBlocks;
