const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Activity } = require('../models');

const activityPopulateOptions = {
  path: 'users',
  select: 'username wallet _id',
  populate: {
    path: 'wallet',
    select: 'walletAddress -_id',
  },
};

const createActivity = async (...userIds) => {
  const users = [...new Set(userIds)];
  if (users.length < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Activity needs to include at least 2 users');
  }
  if (await Activity.alreadyCreated(...userIds)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Activity for these users have already been created');
  }

  const activity = await Activity.create({ users });
  return activity.populate(activityPopulateOptions);
};

const queryActivity = async (filter, options) => {
  const activities = await Activity.paginate(filter, {
    ...options,
    populate: activityPopulateOptions,
  });
  return activities;
};

const findActivity = async (...userIds) => {
  const users = [...new Set(userIds)];
  const activity = await Activity.findOne({
    $and: [{ users: { $all: users } }, { users: { $size: users.length } }],
  }).populate(activityPopulateOptions);

  return activity;
};

const getActivityByIdAndUsers = async (activityId, userIds) => {
  const users = [...new Set(userIds)];
  const activity = await Activity.findOne({
    $and: [{ _id: activityId }, { users: { $all: users } }, { users: { $size: users.length } }],
  });
  return activity;
};

const getActivityByIdAndPartialUser = async (activityId, userId) => {
  const activity = await Activity.findOne({
    $and: [{ _id: activityId }, { users: { $all: [userId] } }],
  });
  return activity;
};

const updateActivityPreview = async (id, preview) => {
  const activity = await Activity.findById(id);
  Object.assign(activity, { preview });
  return activity.save();
};

module.exports = {
  createActivity,
  queryActivity,
  findActivity,
  getActivityByIdAndUsers,
  getActivityByIdAndPartialUser,
  updateActivityPreview,
};
