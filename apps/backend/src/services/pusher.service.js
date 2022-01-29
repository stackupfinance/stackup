const Pusher = require('pusher');
const { realTime } = require('../config/config');
const { type } = require('../config/transaction');

const pusher = new Pusher({
  appId: realTime.pusher.appId,
  key: realTime.pusher.key,
  secret: realTime.pusher.secret,
  cluster: realTime.pusher.cluster,
  useTLS: true,
});

module.exports.auth = async (socketId, channelName) => {
  return pusher.authenticate(socketId, channelName);
};

module.exports.pushRecoverAccountUpdates = async (channelId, data) => {
  return pusher.trigger(`recover-account-${channelId}`, type.recoverAccount, data);
};

module.exports.pushGenericRelayUpdates = async (userId, data) => {
  return pusher.trigger(`private-${userId}-activity`, type.genericRelay, data);
};

module.exports.pushRequestGuardianApprovals = async (users) => {
  return Promise.all(users.map((u) => pusher.trigger(`private-${u._id}-activity`, type.recoverAccount, {})));
};

module.exports.pushNewPaymentUpdate = async (userId, activityItem) => {
  return pusher.trigger(`private-${userId}-activity`, type.newPayment, { activityItem });
};
