const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const inviteService = require('../services/invite.service');

module.exports.getInvite = catchAsync(async (req, res) => {
  const invite = await inviteService.findInviteByCode(req.query.code);
  if (!invite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invite not found, double check your e-mail or join the waitlist!');
  }
  if (invite.used) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invite has already been used, contact us if you think this is a mistake.');
  }
  res.send(invite);
});
