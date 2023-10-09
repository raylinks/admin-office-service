import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), './.env'),
});

export default {
  port: parseInt(process.env.PORT),
  env: process.env.ENV,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    user: process.env.REDIS_UER,
    pass: process.env.REDIS_PASS,
    port: process.env.REDIS_PORT,
  },
  db: {
    userService: process.env.USERDATA_SERVICE_DATABASE_URL,
    fiatService: process.env.FIAT_SERVICE_DATABASE_URL,
    walletService: process.env.WALLET_SERVICE_DATABASE_URL,
    giftCardService: process.env.GIFT_SERVICE_DATABASE_URL,
    cryptoService: process.env.CRYPTO_SERVICE_DATABASE_URL,
    notificationService: process.env.NOTIFICATION_SERVICE_DATABASE_URL,
  },
  rmq: {
    urls: process.env.RMQ_URLS.split(','),
  },
  encKey: process.env.ENCRYPTION_KEY,
  encAlg: process.env.ENCRYPTION_ALG,
  mailChimpApiKey: process.env.MAILCHIMP_API_KEY,
  idpass: {
    apiUrl: process.env.ID_PASS_API_URL,
    appID: process.env.ID_PASS_APP_ID,
    apiKey: process.env.ID_PASS_API_KEY,
  },
  appLink: process.env.APPL_LINK,
  smile: {
    partnerID: process.env.SMILE_PARTNER_ID,
    apiKey: process.env.SMILE_API_KEY,
    baseURL: process.env.SMILE_API_URL,
    callbackURL: process.env.SMILE_CALLBACK_URL,
    sidServer: process.env.SMILE_SID_SERVER_ID,
  },
  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
  sentryDSN: process.env.ADMIN_SERVICE_SENTRY_DSN,
};
