const Joi = require('joi');
const { username, password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    username: Joi.string().required().custom(username),
    password: Joi.string().required().custom(password),
  }),
};

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
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

const recoverSendVerificationEmail = {
  body: Joi.object().keys({
    username: Joi.string().required(),
  }),
};

const recoverVerifyEmail = {
  body: Joi.object().keys({
    code: Joi.number().required(),
    username: Joi.string().required(),
    newOwner: Joi.string().required(),
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
  login,
  logout,
  refreshTokens,
  recoverLookup,
  recoverSendVerificationEmail,
  recoverVerifyEmail,
  verifyEmail,
  authPusher,
};
