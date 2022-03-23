const mongoose = require('mongoose');
const app = require('./app');
const queue = require('./queue');
const config = require('./config/config');
const logger = require('./config/logger');
const { types } = require('./config/queue');
const { getChainId } = require('./utils/web3');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  queue.start().then(async () => {
    logger.info('Connected to job queue');

    await queue.cancel({ name: types.checkForBlocks });
    if (config.alchemy.appUrl) {
      const chainId = await getChainId();
      await queue
        .create(types.checkForBlocks, { chainId })
        .repeatEvery('10 seconds')
        .unique({ 'data.chainId': chainId })
        .save();
    }
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');

  if (server) {
    server.close();
  }

  queue.close();
});
