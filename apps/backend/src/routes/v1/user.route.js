const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { airdropUSDC } = require('../../middlewares/testnet/airdropUsdc');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/:userId')
  .get(auth(), validate(userValidation.getUser), userController.getUser)
  .patch(auth(), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth(), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/wallet')
  .patch(auth(), validate(userValidation.updateUserWallet), airdropUSDC, userController.updateUserWallet)
  .get(auth(), validate(userValidation.getUserWallet), userController.getUserWallet);

router
  .route('/:userId/wallet/hydrate-guardians')
  .post(auth(), validate(userValidation.hydrateUserWalletGuardians), userController.hydrateUserWalletGuardians);

router
  .route('/:userId/notifications')
  .get(auth(), validate(userValidation.getUserNotifications), userController.getUserNotifications);

router
  .route('/:userId/notifications/:notificationId')
  .delete(auth(), validate(userValidation.deleteUserNotification), userController.deleteUserNotification);

router.route('/:userId/search').get(auth(), validate(userValidation.getUserSearch), userController.getUserSearch);

router
  .route('/:userId/activities')
  .get(auth(), validate(userValidation.getUserActivities), userController.getUserActivities);

router
  .route('/:userId/activity/:activityId')
  .get(auth(), validate(userValidation.getUserActivityItems), userController.getUserActivityItems);

router
  .route('/:userId/transaction/paymaster-approval')
  .post(auth(), validate(userValidation.transactionPaymasterApproval), userController.transactionPaymasterApproval);

router.route('/:userId/transaction').post(auth(), validate(userValidation.postTransaction), userController.postTransaction);

router
  .route('/:userId/transaction/history')
  .get(auth(), validate(userValidation.getUserTransactionHistory), userController.getUserTransactionHistory);

module.exports = router;
