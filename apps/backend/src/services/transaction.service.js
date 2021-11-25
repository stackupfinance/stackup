const queue = require('../queue');
const jobs = require('../config/jobs');

const monitorNewPaymentTransaction = async (data) => {
  queue.now(jobs.NEW_PAYMENT, data);
};

module.exports = {
  monitorNewPaymentTransaction,
};
