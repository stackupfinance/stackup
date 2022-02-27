const { inviteService } = require('../services');
const { featureFlag } = require('../config/config');

module.exports.burnInvite = async (req, res, next) => {
  if (!featureFlag.whitelist) {
    next();
  } else {
    const invite = await inviteService.findInviteByCode(req.query.inviteCode);
    await inviteService.updateInvite(invite, { used: true });
  }
};
