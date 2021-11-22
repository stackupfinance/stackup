const jobs = require('../config/jobs');
const logger = require('../config/logger');

const log = (msg) => logger.info(`JOB ${jobs.NEW_PAYMENT}: ${msg}`);

const transactions = (queue) => {
  queue.define(jobs.NEW_PAYMENT, async (job) => {
    const { activityId } = job.attrs.data;

    log(activityId);
  });
};

module.exports = transactions;
