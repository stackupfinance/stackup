const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tokenValidation = require('../../validations/token.validation');
const tokenController = require('../../controllers/token.controller');

const router = express.Router();

router
  .route('/token-list')
  .get(auth(), validate(tokenValidation.getTokenList), tokenController.getTokenList);

router
  .route('/exchange-rates')
  .post(auth(), validate(tokenValidation.getExchangeRates), tokenController.getExchangeRates);

router
  .route('/:tokenFeedProxyAddress/exchange-rate')
  .get(auth(), validate(tokenValidation.getExchangeRate), tokenController.getExchangeRate);

module.exports = router;