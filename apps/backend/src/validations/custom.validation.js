const Joi = require('joi');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const username = (value, helpers) => {
  if (!value.match(/^[a-zA-Z0-9_.-]*$/)) {
    return helpers.message('Username can only contain alphanumeric characters, periods, underscores and hyphens');
  }
  return value;
};

// TODO: Make this more specific.
const userOperation = Joi.object().keys({
  sender: Joi.string().required(),
  nonce: Joi.number().required(),
  initCode: Joi.string().required(),
  callData: Joi.string().required(),
  callGas: Joi.number().required(),
  verificationGas: Joi.number().required(),
  preVerificationGas: Joi.number().required(),
  maxFeePerGas: Joi.number().required(),
  maxPriorityFeePerGas: Joi.number().required(),
  paymaster: Joi.string().required(),
  paymasterData: Joi.string().required(),
  signature: Joi.string().required(),
});

module.exports = {
  objectId,
  username,
  userOperation,
};
