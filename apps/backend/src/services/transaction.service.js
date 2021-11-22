const queue = require('../queue');
const jobs = require('../config/jobs');

const monitorNewPaymentTransaction = async (activityId) => {
  queue.now(jobs.NEW_PAYMENT, { activityId });
};

module.exports = {
  monitorNewPaymentTransaction,
};
