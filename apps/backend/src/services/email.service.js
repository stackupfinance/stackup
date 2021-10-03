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
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} username
 * @param {string} email
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (username, email, token) => {
  const subject = 'Stackup reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `https://stackup.sh/verify-email?token=${token}`;
  await sendEmail(email, subject, resetPasswordEmail(username, resetPasswordUrl));
};

/**
 * Send verification email
 * @param {string} username
 * @param {string} email
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (username, email, token) => {
  const subject = 'Stackup email verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `https://stackup.sh/verify-email?token=${token}`;
  await sendEmail(email, subject, verifyEmail(username, verificationEmailUrl));
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
