export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    walletId: string;
    timestamp: Date;
    relatedWalletId?: string;
    idempotencyKey?: string;
}