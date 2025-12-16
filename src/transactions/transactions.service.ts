import { Injectable } from '@nestjs/common';
import { Transaction, TransactionType } from './interfaces/transactions.interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
    private transactions: Transaction[] = [];
    private processedKeys: Map<string, string> = new Map();

    public findTransactionByProcessedKey(idempotencyKey: string): Transaction | undefined {
        const existingTransactionId = this.processedKeys.get(idempotencyKey);
        if (!existingTransactionId) {
            return undefined;
        }
        return this.transactions.find(t => t.id === existingTransactionId);
    }

    public recordTransaction(
        walletId: string,
        type: TransactionType,
        amount: number,
        relatedWalletId?: string,
        idempotencyKey?: string,
    ): Transaction {


        if (idempotencyKey) {
            const existingTransaction = this.findTransactionByProcessedKey(idempotencyKey);
            if (existingTransaction) {
                return existingTransaction;
            }
        }

        // CREATE NEW TRANSACTION
        const newTransaction: Transaction = {
            id: uuidv4(),
            type,
            walletId,
            amount,
            timestamp: new Date(),
            relatedWalletId,
            idempotencyKey,
        };

        this.transactions.push(newTransaction);

        // MARK KEY AS PROCESSED
        if (idempotencyKey) {
            this.processedKeys.set(idempotencyKey, newTransaction.id);
        }

        return newTransaction;
    }

    public findWalletTransactions(walletId: string): Transaction[] {
        return this.transactions
            .filter((t) => t.walletId === walletId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
}