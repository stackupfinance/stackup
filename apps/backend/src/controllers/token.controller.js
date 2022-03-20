const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const tokenList = require('../data/tokenList');

module.exports.getTokenList = catchAsync(async (req, res) => {
  res.send(tokenList);
});