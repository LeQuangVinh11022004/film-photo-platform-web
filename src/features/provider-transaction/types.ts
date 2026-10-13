
export type TransactionType =
  | "payment"
  | "platform_fee"
  | "refund"
  | "adjustment"
  | "payout";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed";

export type Transaction = {
  id: string;
  bookingId?: string;
  customerName?: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  netAmount: number;
  createdAt: string;
  paymentMethod: string;
};
