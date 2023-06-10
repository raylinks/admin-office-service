export enum Role {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATION = 'OPERATION',
}

export enum RMQ_NAMES {
  CRYPTO_SERVICE = 'CRYPTO_SERVICE',
  FIAT_SERVICE = 'FIAT_SERVICE',
  WALLET_SERVICE = 'WALLET_SERVICE',
  NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE',
  USERDATA_SERVICE = 'USERDATA_SERVICE',
  GIFTCARD_SERVICE = 'GIFTCARD_SERVICE',
}

export enum QUEUE_NAMES {
  FUREX_CRYPTO_QUEUE = 'furex-crypto-service',
  FUREX_FIAT_QUEUE = 'furex-fiat-service',
  FUREX_WALLET_QUEUE = 'furex-wallet-service',
  FUREX_NOTIFICATION_QUEUE = 'furex-notification-service',
  FUREX_USERDATA_QUEUE = 'furex-userdata-service',
  FUREX_GIFTCARD_QUEUE = 'furex-giftcard-service',
}
