const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    PUSHER_APP_ID: Joi.string().required().description('App Id for Pusher channels'),
    PUSHER_KEY: Joi.string().required().description('Key for Pusher channels'),
    PUSHER_SECRET: Joi.string().required().description('Secret for Pusher channels'),
    PUSHER_CLUSTER: Joi.string().required().description('Cluster for Pusher channels'),
    WEB3_MNEMONIC: Joi.string().required().description('Mnemonic for paymaster signer and relayer'),
    WEB3_PAYMASTER: Joi.string().required().description('Paymaster address for sponsoring gasless transactions'),
    WEB3_RPC: Joi.string().required().description('RPC for the correct network'),
    WEB3_USDC: Joi.string().required().description('ERC20 token address for USDC'),
    WEB3_USDC_PRICE_FEED: Joi.string().required().description('Chainlink address for USDC price feed'),
    ANALYTICS_URL: Joi.string().required().description('Analytics url for proxying events'),
    INTERCOM_IDENTITY_VERIFICATION_SECRET: Joi.string().default('').description('Intercom identity verification secret'),
    FEATURE_FLAG_AIRDROP_USDC: Joi.boolean().default(false).description('Automatically send new testnet accounts USDC'),
    FEATURE_FLAG_WHITELIST: Joi.boolean().default(false).description('Enforce an invite only whitelist for sign up.'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {},
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  realTime: {
    pusher: {
      appId: envVars.PUSHER_APP_ID,
      key: envVars.PUSHER_KEY,
      secret: envVars.PUSHER_SECRET,
      cluster: envVars.PUSHER_CLUSTER,
    },
  },
  web3: {
    mnemonic: envVars.WEB3_MNEMONIC,
    paymaster: envVars.WEB3_PAYMASTER,
    rpc: envVars.WEB3_RPC,
    usdc: envVars.WEB3_USDC,
    usdcPriceFeed: envVars.WEB3_USDC_PRICE_FEED,
  },
  analytics: {
    url: envVars.ANALYTICS_URL,
  },
  intercom: {
    identityVerificationSecret: envVars.INTERCOM_IDENTITY_VERIFICATION_SECRET,
  },
  featureFlag: {
    airdropUSDC: envVars.FEATURE_FLAG_AIRDROP_USDC,
    whitelist: envVars.FEATURE_FLAG_WHITELIST,
  },
};
