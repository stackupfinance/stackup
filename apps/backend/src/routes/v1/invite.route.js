const express = require('express');
const inviteController = require('../../controllers/invite.controller');

const router = express.Router();

router.route('/').get(inviteController.getInvite);
router.route('/').post(inviteController.addInvite);

module.exports = router;
