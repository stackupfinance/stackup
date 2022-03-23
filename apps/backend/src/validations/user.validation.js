const Joi = require('joi');
const { activityId, objectId, userOperation } = require('./custom.validation');

module.exports.getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports.updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      isOnboarded: Joi.boolean(),
      email: Joi.string().email(),
      avatar: Joi.string().uri(),
      bio: Joi.string().max(150),
      unset: Joi.array().items(Joi.string().valid('email', 'avatar', 'bio')).default([]),
    })
    .min(1),
};

module.exports.deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports.updateUserWallet = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      walletAddress: Joi.string(),
      initImplementation: Joi.string(),
      initEntryPoint: Joi.string(),
      initOwner: Joi.string(),
      initGuardians: Joi.array().items(Joi.string()),
      encryptedSigner: Joi.string().base64(),
    })
    .min(1),
};

module.exports.getUserWallet = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports.hydrateUserWalletGuardians = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    guardians: Joi.array().items(Joi.string()).required(),
  }),
};

module.exports.getWalletHoldings = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports.getUserNotifications = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports.deleteUserNotification = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    notificationId: Joi.string().custom(objectId),
  }),
};

module.exports.getUserSearch = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    account: Joi.string().required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports.getUserActivities = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports.getUserActivityItems = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    activityId: Joi.string().custom(activityId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports.postTransaction = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message: Joi.string().default(''),
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

module.exports.transactionPaymasterApproval = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

module.exports.getUserTransactionHistory = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports.getUserFiatDepositSession = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
