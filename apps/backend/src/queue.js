const Agenda = require('agenda');
const config = require('./config/config');
const { GenericRelayJobs, RecoverAccountJobs, TransactionsJobs } = require('./jobs');

const connectionOpts = {
  db: { address: config.mongoose.url, collection: 'jobs' },
};
const queue = new Agenda(connectionOpts);
GenericRelayJobs(queue);
RecoverAccountJobs(queue);
TransactionsJobs(queue);

module.exports = queue;
