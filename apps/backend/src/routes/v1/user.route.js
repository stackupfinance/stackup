const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/wallet')
  .patch(auth('manageUsers'), validate(userValidation.updateUserWallet), userController.updateUserWallet)
  .get(auth('getUsers'), validate(userValidation.getUserWallet), userController.getUserWallet);

router
  .route('/:userId/notifications')
  .get(auth('getUsers'), validate(userValidation.getUserNotifications), userController.getUserNotifications);

router
  .route('/:userId/notifications/:notificationId')
  .delete(auth('manageUsers'), validate(userValidation.deleteUserNotification), userController.deleteUserNotification);

router.route('/:userId/search').get(auth('getUsers'), validate(userValidation.getUserSearch), userController.getUserSearch);

router
  .route('/:userId/activity')
  .get(auth('getUsers'), validate(userValidation.getUserActivities), userController.getUserActivities)
  .post(auth('manageUsers'), validate(userValidation.createUserActivity), userController.createUserActivity);

router
  .route('/:userId/activity/find')
  .get(auth('getUsers'), validate(userValidation.findUserActivity), userController.findUserActivity);

router
  .route('/:userId/activity/paymasterApproval')
  .post(auth('manageUsers'), validate(userValidation.approveUserActivity), userController.approveUserActivity);

router
  .route('/:userId/activity/:activityId')
  .get(auth('getUsers'), validate(userValidation.getUserActivityItems), userController.getUserActivityItems)
  .post(auth('manageUsers'), validate(userValidation.createUserActivityItem), userController.createUserActivityItem);

module.exports = router;
