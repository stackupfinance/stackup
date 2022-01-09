const Pusher = require('pusher');
const { realTime } = require('../config/config');
const { types } = require('../config/events');

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

const pushRecoverAccountUpdates = async (channelId, data) => {
  return pusher.trigger(`recover-account-${channelId}`, types.recoverAccount, data);
};

const pushGenericRelayUpdates = async (userId, data) => {
  return pusher.trigger(`private-${userId}-activity`, types.genericRelay, data);
};

const pushRequestGuardianApprovals = async (users) => {
  return Promise.all(users.map((u) => pusher.trigger(`private-${u._id}-activity`, types.recoverAccount, {})));
};

const pushNewPaymentUpdate = async (activityItem) => {
  const users = [activityItem.fromUser, activityItem.toUser];
  return Promise.all(users.map((user) => pusher.trigger(`private-${user}-activity`, types.newPayment, { activityItem })));
};

module.exports = {
  auth,
  pushRecoverAccountUpdates,
  pushGenericRelayUpdates,
  pushRequestGuardianApprovals,
  pushNewPaymentUpdate,
};
