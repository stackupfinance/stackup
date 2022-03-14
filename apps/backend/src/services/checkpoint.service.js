const Checkpoint = require('../models/checkpoint.model');

module.exports.getCheckpointByChainId = async (chainId) => {
  return Checkpoint.findOne({ chainId });
};

module.exports.updateCheckpointByChainId = async (chainId, lastBlockNumber) => {
  return Checkpoint.updateOne({ chainId }, { lastBlockNumber }, { upsert: true });
};
