const Joi = require('joi');
const { username, userOperation } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    username: Joi.string().required().custom(username),
    wallet: Joi.object().keys({
      walletAddress: Joi.string().required(),
      initImplementation: Joi.string().required(),
      initEntryPoint: Joi.string().required(),
      initOwner: Joi.string().required(),
      initGuardians: Joi.array().items(Joi.string()).required(),
      encryptedSigner: Joi.string().base64().required(),
    }),
  }),
};

const lookup = {
  body: Joi.object().keys({
    username: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    signature: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const recoverLookup = {
  body: Joi.object().keys({
    username: Joi.string().required().custom(username),
  }),
};

const recoverPaymasterApproval = {
  body: Joi.object().keys({
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

const recoverSendVerificationEmail = {
  body: Joi.object().keys({
    username: Joi.string().required(),
  }),
};

const recoverVerifyEmail = {
  body: Joi.object().keys({
    code: Joi.number().required(),
    username: Joi.string().required(),
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

const recoverConfirm = {
  body: Joi.object().keys({
    channelId: Joi.string().required(),
    username: Joi.string().required(),
    signature: Joi.string().required(),
    encryptedSigner: Joi.string().required(),
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    code: Joi.number().required(),
  }),
};

const authPusher = {
  body: Joi.object().keys({
    socket_id: Joi.string().required(),
    channel_name: Joi.string().required(),
  }),
};

module.exports = {
  register,
  lookup,
  login,
  logout,
  refreshTokens,
  recoverLookup,
  recoverPaymasterApproval,
  recoverSendVerificationEmail,
  recoverVerifyEmail,
  recoverConfirm,
  verifyEmail,
  authPusher,
};
