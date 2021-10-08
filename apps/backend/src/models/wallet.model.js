const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const { types } = require('../config/wallets');
const secretService = require('../services/secret.service');

const walletSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [types.internal],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEthereumAddress(value)) {
          throw new Error('Invalid wallet address');
        }
      },
    },
    publicKey: {
      type: String,
      required: [
        function () {
          return this.type === types.internal;
        },
        'A public key is required for internal type wallets',
      ],
    },
    mnemonic: {
      type: String,
      required: [
        function () {
          return this.type === types.internal;
        },
        'A mnemonic is required for internal type wallets',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
walletSchema.plugin(toJSON);
walletSchema.plugin(paginate);

/**
 * Returns decrypted mnemonic for internal wallet
 * @returns {Promise<string | null>}
 */
walletSchema.methods.getDecryptedMnemonic = async function () {
  const wallet = this;
  return secretService.decryptWalletMnemonic(wallet.mnemonic);
};

walletSchema.pre('save', async function (next) {
  const wallet = this;
  if (wallet.isModified('mnemonic')) {
    this.mnemonic = await secretService.encryptWalletMnemonic(wallet.mnemonic);
  }
  next();
});

/**
 * @typedef Wallet
 */
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
