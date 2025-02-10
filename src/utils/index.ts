// src/utils/index.ts

export const formatNumber = (num: number, decimals: number = 4): string => {
  if (isNaN(num)) return '0';
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const calculatePricePerToken = (solAmount: number, tokenAmount: number): number => {
  if (!solAmount || !tokenAmount || tokenAmount === 0) return 0;
  return solAmount / tokenAmount;
};

// Adicione mais funções utilitárias conforme necessário
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatSolAmount = (lamports: number): number => {
  return lamports / 1e9;
};
