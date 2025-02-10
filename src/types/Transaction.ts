// src/types/Transaction.ts

export type TokenTransfer = {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
};

export type NativeTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
};

export type AccountData = {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: Array<{
    userAccount: string;
    tokenAccount: string;
    rawTokenAmount: {
      tokenAmount: string;
      decimals: number;
    };
    mint: string;
  }>;
};

export type Instruction = {
  accounts: string[];
  data: string;
  programId: string;
  innerInstructions: any[]; // Pode ser aprimorado com tipagem adequada
};

export type RawTransaction = {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  tokenTransfers: TokenTransfer[];
  nativeTransfers: NativeTransfer[];
  accountData: AccountData[];
  transactionError: any;
  instructions: Instruction[];
  events: any;
};

export type Transaction = {
  signature: string;
  timestamp: number;
  feePayer: string;
  type: string;
  solAmount: number;
  tokenAmount: number;
  tokenMint: string;
  fee: number;
  slot: number;
  direction: 'COMPRA' | 'VENDA' | 'UNKNOWN';
  totalValue: number;
};
