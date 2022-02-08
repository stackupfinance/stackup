const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/lookup', validate(authValidation.lookup), authController.lookup);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/recover/lookup', validate(authValidation.recoverLookup), authController.recoverLookup);
router.post(
  '/recover/paymaster-approval',
  validate(authValidation.recoverPaymasterApproval),
  authController.recoverPaymasterApproval
);
router.post(
  '/recover/request-guardian-approval',
  validate(authValidation.recoverRequestGuardianApproval),
  authController.recoverRequestGuardianApproval
);
router.post(
  '/recover/send-guardian-approval',
  auth(),
  validate(authValidation.recoverSendGuardianApproval),
  authController.recoverSendGuardianApproval
);
router.post(
  '/recover/send-verification-email',
  validate(authValidation.recoverSendVerificationEmail),
  authController.recoverSendVerificationEmail
);
router.post('/recover/verify-email', validate(authValidation.recoverVerifyEmail), authController.recoverVerifyEmail);
router.post('/recover/confirm', validate(authValidation.recoverConfirm), authController.recoverConfirm);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', auth(), validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/pusher', auth(), validate(authValidation.authPusher), authController.authPusher);

module.exports = router;
