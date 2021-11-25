const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/wallet')
  .post(auth('manageUsers'), validate(userValidation.createUserWallet), userController.createUserWallet)
  .get(auth('getUsers'), validate(userValidation.getUserWallet), userController.getUserWallet);

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
