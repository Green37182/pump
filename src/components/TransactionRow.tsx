import styled from '@emotion/styled';
import { Transaction, TransactionType } from '../types';
import { formatNumber, shortenAddress, calculatePricePerToken } from '../utils';

interface Props {
  transaction: Transaction;
  marketId: string;
}

export const TransactionRow = ({ transaction, marketId }: Props) => {
  const marketTransfer = transaction.tokenTransfers?.find(t => t.mint === marketId);
  if (!marketTransfer) return null;

  const getTransactionType = (): TransactionType => {
    if (marketTransfer.fromUserAccount === transaction.feePayer) {
      return 'SELL';
    } else if (marketTransfer.toUserAccount === transaction.feePayer) {
      return 'BUY';
    }
    return 'UNKNOWN';
  };

  const type = getTransactionType();
  const totalTokenAmount = parseFloat(marketTransfer.tokenAmount);
  
  const getSolAmount = (): number => {
    if (!transaction.nativeTransfers) return 0;

    if (type === 'BUY') {
      return transaction.nativeTransfers
        .filter(t => t.fromUserAccount === transaction.feePayer)
        .reduce((sum, t) => sum + (t.amount / 1e9), 0);
    } else {
      return transaction.nativeTransfers
        .filter(t => t.toUserAccount === transaction.feePayer)
        .reduce((sum, t) => sum + (t.amount / 1e9), 0);
    }
  };

  const solAmount = getSolAmount();
  const pricePerToken = calculatePricePerToken(solAmount, totalTokenAmount);

  return (
    <TableRow>
      <td>{new Date(transaction.timestamp * 1000).toLocaleString()}</td>
      <TypeCell type={type}>{type}</TypeCell>
      <td>{formatNumber(totalTokenAmount, 6)}</td>
      <td>{formatNumber(pricePerToken, 9)} SOL</td>
      <td>{formatNumber(solAmount)} SOL</td>
      <td>
        <Link 
          href={`https://solscan.io/account/${transaction.feePayer}`} 
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress(transaction.feePayer)}
        </Link>
      </td>
      <td>
        <Link 
          href={`https://solscan.io/tx/${transaction.signature}`} 
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress(transaction.signature)}
        </Link>
      </td>
    </TableRow>
  );
};

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TypeCell = styled.td<{ type: TransactionType }>`
  color: ${({ type }) => type === 'BUY' ? '#4CAF50' : type === 'SELL' ? '#f44336' : '#757575'};
  font-weight: 500;
`;

const Link = styled.a`
  color: #0066cc;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
