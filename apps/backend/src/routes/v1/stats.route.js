const express = require('express');
const statsController = require('../../controllers/stats.controller');

const router = express.Router();

router.route('/').get(statsController.getStats);

module.exports = router;
