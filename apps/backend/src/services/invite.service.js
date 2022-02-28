const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Invite } = require('../models');

module.exports.findInviteByCode = async (code) => {
  const invite = await Invite.findOne({ code });
  if (!invite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invite not found, double check your e-mail or join the waitlist!');
  }
  if (invite.used) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invite has already been used, contact us if you think this is a mistake.');
  }

  return invite;
};

module.exports.updateInvite = async (invite, updates) => {
  Object.assign(invite, updates);

  await invite.save();
  return invite;
};
