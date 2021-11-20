const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { status } = require('../config/users');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    username: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

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
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      avatar: Joi.string().uri(),
      bio: Joi.string().max(150),
      status: Joi.string().valid(status.created, status.onboarded),
      unset: Joi.array().items(Joi.string().valid('email', 'avatar', 'bio')).default([]),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const createUserWallet = {
  body: Joi.object().keys({
    walletAddress: Joi.string().required(),
    initSignerAddress: Joi.string().required(),
    encryptedSigner: Joi.string().base64().required(),
  }),
};

const getUserWallet = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
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
};

const createUserActivityItem = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    activityId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userOperations: Joi.array().items(Joi.object().keys({})).required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUserWallet,
  getUserWallet,
  getUserSearch,
  findUserActivity,
  getUserActivities,
  createUserActivity,
  getUserActivityItems,
  createUserActivityItem,
};
