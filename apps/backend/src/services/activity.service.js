const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Activity } = require('../models');

const createActivity = async (...userIds) => {
  const users = [...new Set(userIds)];
  if (users.length < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Activity needs to include at least 2 users');
  }
  if (await Activity.alreadyCreated(...userIds)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Activity for these users have already been created');
  }

  return Activity.create({ users });
};

const queryActivity = async (filter, options) => {
  const activities = await Activity.paginate(filter, options);
  return activities;
};

const findActivity = async (...userIds) => {
  const users = [...new Set(userIds)];
  const activity = await Activity.findOne({ $and: [{ users: { $all: users } }, { users: { $size: users.length } }] });

  return activity;
};

module.exports = {
  createActivity,
  queryActivity,
  findActivity,
};
