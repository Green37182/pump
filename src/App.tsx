// src/App.tsx

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Transaction, RawTransaction } from './types/Transaction';
import { TransactionsTable } from './components/TransactionsTable';
import * as XLSX from 'xlsx';
import { categorizeTransaction } from './utils/categorizeTransaction';

const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const HELIUS_API = `https://api.helius.xyz/v0`;

function App() {
  const [marketId, setMarketId] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [limit, setLimit] = useState<number>(100);
  const [totalSOL, setTotalSOL] = useState<number>(0);

  const fetchTransactions = async () => {
    if (!marketId) {
      alert('Por favor, insira um ID de mercado');
      return;
    }

    setLoading(true);
    setTransactions([]);
    setTotalSOL(0);

    try {
      const url = new URL(`${HELIUS_API}/addresses/${marketId}/transactions`);
      url.searchParams.append('api-key', HELIUS_API_KEY);
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const txs: RawTransaction[] = await response.json();

      setProgress(`Encontradas ${txs.length} transações. Processando...`);
      const processedTxs: Transaction[] = [];

      for (const tx of txs) {
        try {
          console.log('Transação Bruta:', tx);

          const transaction = categorizeTransaction(tx);
          processedTxs.push(transaction);
          setProgress(
            `Processadas ${processedTxs.length} de ${txs.length} transações`
          );
        } catch (txError) {
          console.error('Erro processando transação:', txError);
          console.error('Transação problemática:', tx);
          continue;
        }
      }

      setTransactions(processedTxs);
      const total = processedTxs.reduce((acc, tx) => acc + tx.solAmount, 0);
      setTotalSOL(total);
    } catch (error: any) {
      console.error('Erro:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido ocorreu'}`);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const exportToExcel = () => {
    if (!transactions.length) return;

    const ws = XLSX.utils.json_to_sheet(
      transactions.map((tx) => ({
        Data: new Date(tx.timestamp * 1000).toLocaleString('pt-BR'),
        Direção: tx.direction,
        'Quantidade Token': tx.tokenAmount.toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
        'Valor SOL': tx.solAmount.toLocaleString('pt-BR', { maximumFractionDigits: 9 }),
        'Preço (SOL/Token)': (tx.tokenAmount > 0 ? tx.solAmount / tx.tokenAmount : 0)
          .toLocaleString('pt-BR', { maximumFractionDigits: 9 }),
        'Taxa (SOL)': tx.fee.toLocaleString('pt-BR', { maximumFractionDigits: 9 }),
        'Pagador Taxa': `${tx.feePayer.slice(0, 4)}...${tx.feePayer.slice(-4)}`,
        'Assinatura': `${tx.signature.slice(0, 4)}...${tx.signature.slice(-4)}`,
        'Slot': tx.slot
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');
    XLSX.writeFile(wb, 'transacoes_mercado.xlsx');
  };

  return (
    <Container>
      <InputContainer>
        <Input
          type="text"
          value={marketId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarketId(e.target.value)}
          placeholder="Digite o ID do mercado"
        />
        <LimitInput
          type="number"
          value={limit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLimit(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))
          }
          placeholder="Limite"
        />
        <Button onClick={fetchTransactions} disabled={loading}>
          {loading ? 'Carregando...' : 'Buscar Dados'}
        </Button>
        <ExportButton 
          onClick={exportToExcel} 
          disabled={loading || transactions.length === 0}
        >
          Exportar para Excel
        </ExportButton>
        {progress && <ProgressSpan>{progress}</ProgressSpan>}
      </InputContainer>

      <TotalSOL>
        <strong>Total de SOL Recebido:</strong> {totalSOL.toLocaleString('pt-BR', { maximumFractionDigits: 9 })} SOL
      </TotalSOL>

      <TransactionsTable 
        transactions={transactions}
        marketId={marketId}
      />
    </Container>
  );
}

// Estilos permanecem os mesmos
const Container = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const InputContainer = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const Input = styled.input`
  padding: 8px;
  width: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const LimitInput = styled(Input)`
  width: 100px;
`;

const Button = styled.button`
  padding: 8px 15px;
  cursor: pointer;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ExportButton = styled(Button)`
  background: #2196F3;

  &:hover {
    background: #1976D2;
  }
`;

const ProgressSpan = styled.span`
  color: #666;
  font-size: 14px;
`;

const TotalSOL = styled.div`
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
`;

export default App;
