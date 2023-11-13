export type QueryCardBuyDto = {
  status?: 'PENDING' | 'CONFIRMED' | 'FAILED';
  limit?: number;
  page?: number;
  userId?: string;
  amount?: number;
  from?: Date;
  to?: Date;
};
