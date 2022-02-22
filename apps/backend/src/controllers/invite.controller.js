/* eslint-disable no-console */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const inviteService = require('../services/invite.service');

const getInvite = catchAsync(async (req, res) => {
  const invite = await inviteService.findInviteCode(req.query.invite);
  if (!invite) throw new ApiError(httpStatus.NOT_FOUND, 'Invite not found');
  if (invite.used) throw new ApiError(httpStatus.BAD_REQUEST, 'Invite already used');
  res.send(invite);
});

const addInvite = catchAsync(async (req, res) => {
  const inviteExists = await inviteService.findInviteCode(req.query.invite);
  if (inviteExists) throw new ApiError(httpStatus.BAD_REQUEST, 'Invite already exists');
  const invite = await inviteService.addInviteCode(req.query.invite);
  if (!invite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot add an invite');
  }
  res.send(invite);
});

module.exports = { getInvite, addInvite };
