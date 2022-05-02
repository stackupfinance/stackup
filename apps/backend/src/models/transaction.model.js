const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const { toJSON, paginate } = require('./plugins');
const { status, chainId, type } = require('../config/transaction');

const lineItem = {
  from: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  to: {
    type: String,
    trim: true,
    index: true,
  },
  value: {
    type: String,
    trim: true,
  },
  units: {
    type: Number,
  },
  prefix: {
    type: String,
    trim: true,
  },
  suffix: {
    type: String,
    trim: true,
  },
  sideEffect: {
    type: String,
    trim: true,
  },
};

const transactionSchema = mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [type.genericRelay, type.recoverAccount, type.newPayment],
      required: true,
    },
    status: {
      type: String,
      enum: [status.pending, status.success, status.failed],
      default: status.pending,
      required: true,
    },
    chainId: {
      type: String,
      enum: [chainId.polygon, chainId.mumbai],
      required: true,
    },
    hash: {
      type: String,
      trim: true,
      unique: true,
      default: () => `PENDING_RELAY_${nanoid()}`,
    },

    lineItems: [{ ...lineItem }],

    fee: {
      value: {
        type: String,
        trim: true,
      },
      units: {
        type: Number,
      },
      prefix: {
        type: String,
        trim: true,
      },
      suffix: {
        type: String,
        trim: true,
      },
      tokenAddress: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
