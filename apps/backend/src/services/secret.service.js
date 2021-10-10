const AkeylessVaultApi = require('akeyless_vault_api');
const logger = require('../config/logger');
const {
  env,
  secretsManagement: { akeyless },
} = require('../config/config');

const api = new AkeylessVaultApi.DefaultApi();
let token;

api.apiClient.basePath = 'https://rest.akeyless.io';
api.auth(
  {
    accessId: akeyless.accessId,
    accessKey: akeyless.accessKey,
  },
  (_, res) => {
    token = res.token;
    logger.info('Connected to secrets manager');
  }
);

/**
 * Encrypts an internal wallet's mnemonic
 * @param {String} mnemonic
 * @returns {Promise<string>}
 */
const encryptWalletMnemonic = async (mnemonic) => {
  return new Promise((resolve, reject) => {
    api.encrypt(`/${env}/users/wallets`, mnemonic, token, {}, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data.response[0]);
      }
    });
  });
};

/**
 * Decrypt an internal wallet's encrypted mnemonic
 * @param {String} mnemonic
 * @returns {Promise<string>}
 */
const decryptWalletMnemonic = async (encryptedMnemonic) => {
  return new Promise((resolve, reject) => {
    api.decrypt(`/${env}/users/wallets`, encryptedMnemonic, token, {}, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data.response[0]);
      }
    });
  });
};

module.exports = {
  encryptWalletMnemonic,
  decryptWalletMnemonic,
};
