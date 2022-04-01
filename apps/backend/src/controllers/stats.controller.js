const catchAsync = require('../utils/catchAsync');
const { signerService } = require('../services');

module.exports.getStats = catchAsync(async (req, res) => {
  const stats = await signerService.getPublicStats();
  res.send(stats);
});
