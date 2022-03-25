const Joi = require('joi');

module.exports.getTokenList = {};

module.exports.getTokenBalances = {
  body: Joi.object().keys({
    tokenAddresses: Joi.array().items(Joi.string()).required().min(1),
  }),
};

module.exports.getExchangeRates = {
  body: Joi.object().keys({
    tokens: Joi.array().items(Joi.object()).required(),
  }),
};

module.exports.getExchangeRate = {
  params: Joi.object().keys({
    tokenFeedProxyAddress: Joi.string(),
  }),
};
