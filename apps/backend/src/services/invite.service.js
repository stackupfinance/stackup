const { Invite } = require('../models');

module.exports.findInviteByCode = async (code) => {
  const findInvite = await Invite.findOne({ code });

  return findInvite;
};

module.exports.updateInviteCodeUsed = async (invite) => {
  const findInvite = await Invite.findOneAndUpdate({ invite }, { used: true });

  return findInvite;
};
