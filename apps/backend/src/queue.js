const Agenda = require('agenda');
const config = require('./config/config');
const { CheckForBlocksJobs, ParseBlockJobs, RelayTransactionJobs } = require('./jobs');

const connectionOpts = {
  db: { address: config.mongoose.url, collection: 'jobs' },
};
const queue = new Agenda(connectionOpts);
CheckForBlocksJobs(queue);
ParseBlockJobs(queue);
RelayTransactionJobs(queue);

module.exports = queue;
