const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { status } = require('../config/payments');

const paymentSchema = mongoose.Schema(
  {
    activity: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Activity',
      required: true,
    },
    status: {
      type: String,
      enum: [status.pending, status.success, status.failed],
      default: status.pending,
    },
    fromUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    message: {
      type: String,
      trim: true,
      require: true,
    },
    transactionHash: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);

/**
 * @typedef Payment
 */
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
