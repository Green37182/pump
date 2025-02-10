// types.ts
export interface Transaction {
  signature: string;
  timestamp: number;
  feePayer: string;
  type: string;
  solAmount: number;
  tokenAmount: number;
  tokenMint: string;
  fee: number;
  slot: number;
  direction: string;
  totalValue: number;
}
