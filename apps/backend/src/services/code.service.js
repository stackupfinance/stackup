const moment = require('moment');
const httpStatus = require('http-status');
const userService = require('./user.service');
const { Code } = require('../models');
const ApiError = require('../utils/ApiError');
const { types } = require('../config/codes');

/**
 * Save verify doc
 * @param {String} userId
 * @param {String} type
 * @returns {Promise<Code>}
 */
const saveCode = async (userId, type) => {
  return Code.create({
    user: userId,
    code: Math.floor(100000 + Math.random() * 900000), // Generate random 6 digit code
    type,
    expires: moment().add('10', 'minutes').toDate(),
  });
};

/**
 * Generate reset password code
 * @param {String} username
 * @returns {Promise<Code>}
 */
const generateResetPasswordCode = async (username) => {
  const user = await userService.getUserByUsername(username);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No account found with this username');
  }
  if (!user.email || !user.isEmailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No verified e-mail for this account');
  }

  return Promise.all([user.email, saveCode(user.id, types.resetPassword)]);
};

/**
 * Generate verify email code
 * @param {User} user
 * @returns {Promise<Code>}
 */
const generateVerifyEmailCode = async (user) => {
  if (!user.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No e-mail linked to this account');
  }
  return saveCode(user.id, types.verifyEmail);
};

/**
 * Checks if a code is valid and not yet expired
 * @param {String} userId
 * @param {String} code
 * @param {String} type
 * @returns {Promise<Code>}
 */
const checkCode = async (userId, code, type) => {
  return Code.findOne({ userId, code, type, expires: { $gt: moment().toDate() } });
};

module.exports = {
  generateResetPasswordCode,
  generateVerifyEmailCode,
  checkCode,
};
