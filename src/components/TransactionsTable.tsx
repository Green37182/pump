// src/components/TransactionsTable.tsx

import React from 'react';
import styled from '@emotion/styled';
import { Transaction } from '../types/Transaction';

interface TransactionsTableProps {
  transactions: Transaction[];
  marketId: string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions,}) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Assinatura</th>
          <th>Tipo</th>
          <th>Direção</th>
          <th>Quantidade Token</th>
          <th>Valor SOL</th>
          <th>Preço (SOL/Token)</th>
          <th>Taxa (SOL)</th>
          <th>Pagador Taxa</th>
          <th>Slot</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.signature}>
            <td>{`${tx.signature.slice(0, 4)}...${tx.signature.slice(-4)}`}</td>
            <td>{tx.type}</td>
            <td>{tx.direction}</td>
            <td>{tx.tokenAmount.toLocaleString('pt-BR', { maximumFractionDigits: 6 })}</td>
            <td>{tx.solAmount.toLocaleString('pt-BR', { maximumFractionDigits: 9 })} SOL</td>
            <td>
              {tx.tokenAmount > 0
                ? (tx.solAmount / tx.tokenAmount).toLocaleString('pt-BR', { maximumFractionDigits: 9 })
                : 'N/A'}
            </td>
            <td>{tx.fee.toLocaleString('pt-BR', { maximumFractionDigits: 9 })} SOL</td>
            <td>{`${tx.feePayer.slice(0, 4)}...${tx.feePayer.slice(-4)}`}</td>
            <td>{tx.slot}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f0f0f0;
  }

  tr:hover {
    background-color: #f9f9f9;
  }
`;
