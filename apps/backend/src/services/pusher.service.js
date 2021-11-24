const Pusher = require('pusher');
const { realTime } = require('../config/config');

const pusher = new Pusher({
  appId: realTime.pusher.appId,
  key: realTime.pusher.key,
  secret: realTime.pusher.secret,
  cluster: realTime.pusher.cluster,
  useTLS: true,
});

const auth = async (socketId, channelName) => {
  return pusher.authenticate(socketId, channelName);
};

const pushNewPaymentUpdate = async (activityItem, users = {}) => {
  return Promise.all(users.map((user) => pusher.trigger(`private-${user}-activity`, 'newPayment', { activityItem })));
};

module.exports = {
  auth,
  pushNewPaymentUpdate,
};
