const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: '@stackupfinance/backend API documentation',
    version,
    license: {
      name: 'GPL-3.0',
      url: 'https://github.com/stackupfinance/stackup/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
