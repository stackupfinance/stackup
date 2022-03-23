const Joi = require('joi');
const { objectId } = require('./custom.validation');

module.exports.getTokenList = {
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