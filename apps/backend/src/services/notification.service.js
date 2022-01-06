const { Notification } = require('../models');
const { types } = require('../config/events');

module.exports.getNotificationsByUserId = async (userId) => {
  return Notification.find({ user: userId }).sort('-createdAt').limit(10).select('-user -updatedAt');
};

module.exports.createRecoverAccountNotifications = async (notifications) => {
  return Notification.create(notifications.map((n) => ({ type: types.recoverAccount, ...n })));
};

module.exports.deleteNotification = async (userId, notificationId) => {
  await Notification.deleteOne({ user: userId, _id: notificationId });

  return this.getNotificationsByUserId(userId);
};
