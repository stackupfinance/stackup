const mongoose = require('mongoose');
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
