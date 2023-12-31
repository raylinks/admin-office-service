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

export enum AUDIT_ACTIONS {
  GIFTCARD_CREATED = 'GIFT_CARD_CREATED',
  GIFTCARD_UPDATED = 'GIFT_CARD_UPDATED',
  GIFTCARD_DELETED = 'GIFT_CARD_DELETED',
  GIFTCARD_DISABLED = 'GIFT_CARD_DISABLED',
  GIFTCARD_RANGE_DISABLED = 'GIFTCARD_RANGE_DISABLED',
  GIFTCARD_RANGE_ENABLED = 'GIFTCARD_RANGE_ENABLED',
  GIFTCARD_ENABLED = 'GIFT_CARD_ENABLED',
  GIFTCARD_RATE_SET = 'GIFT_CARD_RATE_SET',
  DISABLE_CRYPTO = 'DISABLE_CRYPTO',
  ENABLE_CRYPTO = 'ENABLE_CRYPTO',
  SET_CRYPTO_RATE = 'SET_CRYPTO_RATE',
  SET_CRYPTO_FEE = 'SET_CRYPTO_FEE',
  SET_FIAT_RATE = 'SET_FIAT_RATE',
  SET_TRADE_RATE = 'SET_TRADE_RATE',
  APPROVE_GIFTCARD_TRADE = 'APPROVE_GIFTCARD_TRADE',
  DECLINE_GIFTCARD_TRADE = 'DECLINE_GIFTCARD_TRADE',
  CLOSE_GIFTCARD_TRADE = 'CLOSE_GIFTCARD_TRADE',

  GIFTCARD_BUY_CREATED = 'GIFT_CARD_CREATED',
  GIFTCARD_RANGE_CREATED = 'GIFTCARD_RANGE_CREATED',

  RESET_USER_IDENTITY_STATUS = 'RESET_USER_IDENTITY_STATUS',
  VERIFY_USER_IDENTITY_STATUS = 'VERIFY_USER_IDENTITY_STATUS',

}

export enum VETTING_STATUS {
  APPROVE_WITHDRAWAL_REQUEST = 'APPROVE',
  REJECT_WITHDRAWAL_REQUEST = 'REJECT',
}

export const apiURLS = {
  dev: 'https://k8s.myfurex.co',
  prod: 'https://api.myfurex.co',
};
export enum GiftCardEventType {
  BUY = 'BUY',
  SELL = 'SELL',
}
export enum KycLevel {
  LEVEL_0 = 'LEVEL_0',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
}

export const DB_NAMES = {
  GIFTCARD: 'GIFTCARD_SERVICE_DATABASE_CONNECTION',
  WALLET: 'WALLET_SERVICE_DATABASE_CONNECTION',
} as const;

export type CURRENCY = 'NGN' | 'USD';
