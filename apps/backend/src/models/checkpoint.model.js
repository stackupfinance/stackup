const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const checkpointSchema = mongoose.Schema(
  {
    chainId: {
      type: Number,
      unique: true,
    },
    lastBlockNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
checkpointSchema.plugin(toJSON);

/**
 * @typedef Checkpoint
 */
const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);

module.exports = Checkpoint;
