// src/utils/calculateTotalSOL.ts

import { ProcessedTransaction } from '../types/Transaction';

export const calculateTotalSOL = (transactions: ProcessedTransaction[]): number => {
  return transactions.reduce((total, transaction) => {
    transaction.nativeTransfers.forEach((transfer) => {
      if (transfer.toUserAccount === transaction.feePayer) {
        total += transfer.amount;
      }
    });
    return total;
  }, 0);
};
