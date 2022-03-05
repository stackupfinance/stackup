const axios = require('axios').default;
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const POLYGON_WYRE_USDC = 'MUSDC';

module.exports.getSessionUrl = async (userWallet) => {
  try {
    const res = await axios.post(
      `${config.fiat.wyre.apiUrl}/v3/orders/reserve`,
      {
        referrerAccountId: config.fiat.wyre.referrerAccountId,
        dest: `matic:${userWallet}`,
        destCurrency: POLYGON_WYRE_USDC,
        lockFields: ['destCurrency', 'dest'],
      },
      {
        headers: { Authorization: `Bearer ${config.fiat.wyre.secretKey}` },
      }
    );

    return res.data.url;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not start a fiat on-ramp session. Try again later.');
  }
};
