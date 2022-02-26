const { Invite } = require('../models');

async function findInviteCode(invite) {
  const findInvite = await Invite.findOne({ invite });

  if (!findInvite) {
    throw new Error('Invite not found');
  }
  return findInvite;
}

async function updateInviteCodeUsed(invite) {
  const findInvite = await Invite.findOneAndUpdate({ invite }, { used: true });

  if (!findInvite) {
    throw new Error('Invite not found');
  }
  return findInvite;
}

module.exports = { findInviteCode, updateInviteCodeUsed };
