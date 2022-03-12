const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const externalAddressSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    wallet: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
externalAddressSchema.plugin(toJSON);

const ExternalAddress = mongoose.model('ExternalAddress', externalAddressSchema);

module.exports = ExternalAddress;
