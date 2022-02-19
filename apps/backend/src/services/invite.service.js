// const httpStatus = require('http-status');
const { Invite } = require('../models');
// const ApiError = require('../utils/ApiError');

async function findInviteCode(invite) {
  const findInvite = await Invite.findOne({ invite });

  if (!findInvite) {
    throw new Error('Invite not found');
  }
  return findInvite;
}

async function addInviteCode(invite) {
  const findInvite = await Invite.findOne({ invite });

  if (findInvite) {
    throw new Error('Invite already exists');
  }
  const addInvite = new Invite({ invite });

  const addInviteResult = await addInvite.save();
  if (!addInviteResult) throw new Error('Invite not added');
  return addInviteResult;
}

module.exports = { findInviteCode, addInviteCode };
