const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const walletService = require('../services/wallet.service');
const { isValidUsername } = require('../config/name');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!isValidUsername(value)) {
          throw new Error('Username can only contain alphanumeric characters, periods, underscores and hyphens');
        }
      },
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      trim: true,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error('Invalid URL');
        }
      },
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    wallet: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Wallet',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if username is taken
 * @param {String} username - The user's username
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('email')) {
    user.isEmailVerified = false;
  }

  next();
});

userSchema.post('remove', async function (doc) {
  walletService.deleteUserWallets(doc._id);
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
