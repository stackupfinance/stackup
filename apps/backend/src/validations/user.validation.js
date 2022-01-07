const Joi = require('joi');
const { objectId, userOperation } = require('./custom.validation');

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
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

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUserWallet = {
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

const getUserWallet = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getUserNotifications = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const deleteUserNotification = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    notificationId: Joi.string().custom(objectId),
  }),
};

const getUserSearch = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    username: Joi.string().required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const findUserActivity = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    toUserId: Joi.string().custom(objectId).required(),
  }),
};

const approveUserActivity = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

const getUserActivities = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const createUserActivity = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    toUserId: Joi.string().custom(objectId),
  }),
};

const getUserActivityItems = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    activityId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const createUserActivityItem = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    activityId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    toUser: Joi.string().custom(objectId).required(),
    amount: Joi.number().required(),
    message: Joi.string().required(),
    userOperations: Joi.array().items(userOperation).required().min(1),
  }),
};

module.exports = {
  getUser,
  updateUser,
  deleteUser,
  updateUserWallet,
  getUserWallet,
  getUserNotifications,
  deleteUserNotification,
  getUserSearch,
  findUserActivity,
  approveUserActivity,
  getUserActivities,
  createUserActivity,
  getUserActivityItems,
  createUserActivityItem,
};
