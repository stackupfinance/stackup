const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tokenValidation = require('../../validations/token.validation');
const tokenController = require('../../controllers/token.controller');

const router = express.Router();

router
  .route('/tokenList')
  .get(validate(tokenValidation.getTokenList), tokenController.getTokenList);

module.exports = router;