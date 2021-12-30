const Agenda = require('agenda');
const config = require('./config/config');
const { RecoverAccountJobs, TransactionsJobs } = require('./jobs');

const connectionOpts = {
  db: { address: config.mongoose.url, collection: 'jobs' },
};
const queue = new Agenda(connectionOpts);
RecoverAccountJobs(queue);
TransactionsJobs(queue);

module.exports = queue;
