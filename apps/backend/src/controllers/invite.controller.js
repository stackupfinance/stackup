const catchAsync = require('../utils/catchAsync');
const inviteService = require('../services/invite.service');

module.exports.getInvite = catchAsync(async (req, res) => {
  const invite = await inviteService.findInviteByCode(req.query.inviteCode);
  res.send(invite);
});
