const { alchemyService, exchangeService, userService } = require('../services');
const catchAsync = require('../utils/catchAsync');

module.exports.getTokenList = catchAsync(async (req, res) => {
  const tokenListFiltered = await exchangeService.fetchSupportedTokens();
  res.send(tokenListFiltered);
});

module.exports.getTokenBalances = catchAsync(async (req, res) => {
  const { tokenAddresses } = req.body;
  const user = await userService.getUserById(req.user._id);
  const balances = await alchemyService.getTokenBalances(user.wallet.walletAddress, tokenAddresses);

  res.send(balances.result);
});

module.exports.getExchangeRates = catchAsync(async (req, res) => {
  const { tokens } = req.body;
  const exchangeRateMap = await exchangeService.fetchAllExchangeRates(tokens);
  res.send(exchangeRateMap);
});

module.exports.getExchangeRate = catchAsync(async (req, res) => {
  const { tokenFeedProxyAddress } = req.params;
  const exchangeRate = await exchangeService.fetchOneExchangeRate(tokenFeedProxyAddress);
  res.send(exchangeRate);
});
