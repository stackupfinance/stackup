const Agenda = require('agenda');
const config = require('./config/config');
const { RelayTransactionJobs } = require('./jobs');

const connectionOpts = {
  db: { address: config.mongoose.url, collection: 'jobs' },
};
const queue = new Agenda(connectionOpts);
RelayTransactionJobs(queue);

module.exports = queue;
