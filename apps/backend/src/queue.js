const Agenda = require('agenda');
const config = require('./config/config');
const { TransactionsJobs } = require('./jobs');

const connectionOpts = {
  db: { address: config.mongoose.url, collection: 'jobs' },
};
const queue = new Agenda(connectionOpts);
TransactionsJobs(queue);

module.exports = queue;
