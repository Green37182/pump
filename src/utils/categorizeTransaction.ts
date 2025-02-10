// src/utils/categorizeTransaction.ts

import { RawTransaction, Transaction } from '../types/Transaction';

export const categorizeTransaction = (transaction: RawTransaction): Transaction => {
  let direction: 'COMPRA' | 'VENDA' | 'UNKNOWN' = 'UNKNOWN';
  let tokenAmount = 0;
  let solAmount = 0;
  let tokenMint = '';

  // Encontrar os dados da conta do feePayer
  const feePayerAccountData = transaction.accountData.find(
    data => data.account === transaction.feePayer
  );

  // Inicializar variáveis para calcular mudanças de SOL
  let totalSolInput = 0;
  let totalSolOutput = 0;

  if (feePayerAccountData) {
    const netChangeLamports = feePayerAccountData.nativeBalanceChange;
    const feeLamports = transaction.fee;

    // Calcular total de SOL enviado (inputs)
    const sentTransfers = transaction.nativeTransfers.filter(
      transfer => transfer.fromUserAccount === transaction.feePayer
    );
    totalSolOutput = sentTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);

    // Calcular total de SOL recebido (outputs)
    const receivedTransfers = transaction.nativeTransfers.filter(
      transfer => transfer.toUserAccount === transaction.feePayer
    );
    totalSolInput = receivedTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);

    // Calcular solAmount considerando envio e recebimento
    solAmount = (totalSolInput - totalSolOutput - feeLamports) / 1e9;

    // Determinar a direção baseada no fluxo líquido de SOL
    if (solAmount > 0 && tokenAmount > 0) {
      // Possível Compra de Tokens com SOL
      direction = 'COMPRA';
    } else if (solAmount < 0 && tokenAmount > 0) {
      // Possível Venda de Tokens por SOL
      direction = 'VENDA';
    } else {
      direction = 'UNKNOWN';
    }
  }

  // Processar transferências de tokens, se existirem
  if (transaction.tokenTransfers.length > 0) {
    const transfer = transaction.tokenTransfers.find(
      t => t.toUserAccount === transaction.feePayer || t.fromUserAccount === transaction.feePayer
    );

    if (transfer) {
      tokenMint = transfer.mint;

      // Usar rawTokenAmount para maior precisão
      const tokenBalanceChange = transaction.accountData
        .find(data => data.account === transaction.feePayer)
        ?.tokenBalanceChanges.find(change => change.userAccount === transaction.feePayer);

      if (tokenBalanceChange?.rawTokenAmount) {
        const tokenChange = parseInt(tokenBalanceChange.rawTokenAmount.tokenAmount);
        const decimals = tokenBalanceChange.rawTokenAmount.decimals;
        tokenAmount = Math.abs(tokenChange) / Math.pow(10, decimals);

        // Determinar direção baseada no tokenChange
        if (tokenChange > 0) {
          // Recebeu tokens, pode ser considerado COMPRA
          direction = direction === 'UNKNOWN' ? 'COMPRA' : direction;
        } else if (tokenChange < 0) {
          // Enviou tokens, pode ser considerado VENDA
          direction = direction === 'UNKNOWN' ? 'VENDA' : direction;
        }
      } else {
        tokenAmount = Math.abs(transfer.tokenAmount);

        // Determinar direção baseada nas contas de token
        if (transfer.toUserAccount === transaction.feePayer) {
          direction = 'COMPRA';
        } else if (transfer.fromUserAccount === transaction.feePayer) {
          direction = 'VENDA';
        }
      }
    }
  }

  // Calcular totalValue considerando tanto SOL quanto tokens
  // Defina uma taxa de conversão adequada para seus tokens
  const conversionRate = 1; // Exemplo: 1 token = 1 SOL
  const totalValue = solAmount + (tokenAmount * conversionRate);

  // Retornar o objeto Transaction
  return {
    signature: transaction.signature,
    timestamp: transaction.timestamp,
    feePayer: transaction.feePayer,
    type: transaction.type,
    solAmount,
    tokenAmount,
    tokenMint,
    fee: transaction.fee / 1e9, // Convertendo de lamports para SOL
    slot: transaction.slot,
    direction,
    totalValue
  };
};
