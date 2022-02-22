const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON } = require('./plugins');

const inviteSchema = mongoose.Schema(
  {
    invite: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
inviteSchema.plugin(toJSON);

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
