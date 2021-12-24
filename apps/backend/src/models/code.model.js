const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON } = require('./plugins');
const { types } = require('../config/codes');

const codeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isNumeric(value, { no_symbols: true })) {
          throw new Error('Invalid code');
        }

        if (!value.length === 6) {
          throw new Error('Code must be 6 characters');
        }
      },
    },
    type: {
      type: String,
      enum: [types.recoverAccount, types.verifyEmail],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
codeSchema.plugin(toJSON);

/**
 * @typedef Code
 */
const Code = mongoose.model('Code', codeSchema);

module.exports = Code;
