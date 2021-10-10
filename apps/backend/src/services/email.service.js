const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const { resetPasswordEmail, verifyEmail } = require('../utils/emailTemplates');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {String} to
 * @param {String} subject
 * @param {String} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {String} username
 * @param {String} email
 * @param {String} code
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (username, email, code) => {
  const subject = 'Stackup reset password';
  await sendEmail(email, subject, resetPasswordEmail(username, code));
};

/**
 * Send verification email
 * @param {String} username
 * @param {String} email
 * @param {String} code
 * @returns {Promise}
 */
const sendVerificationEmail = async (username, email, code) => {
  const subject = 'Stackup email verification';
  await sendEmail(email, subject, verifyEmail(username, code));
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
