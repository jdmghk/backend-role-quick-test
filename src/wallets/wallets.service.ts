import { Injectable } from '@nestjs/common';
import { Wallet } from './interfaces/wallets.interfaces';
import { v4 as uuidv4 } from 'uuid';
import {
    InsufficientBalanceException,
    WalletNotFoundException,
} from '../common/errors';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class WalletsService {
    private wallets: Map<string, Wallet> = new Map();

    constructor(private transactionsService: TransactionsService) { }

    public createWallet(currency: 'USD'): Wallet {
        const newWallet: Wallet = {
            id: uuidv4(),
            currency,
            balance: 0,
        };
        this.wallets.set(newWallet.id, newWallet);
        return newWallet;
    }

    public findWalletById(id: string): Wallet {
        const wallet = this.wallets.get(id);
        if (!wallet) {
            throw new WalletNotFoundException(id);
        }
        return wallet;
    }

    // 2. Fund Wallet
    public fundWallet(walletId: string, amount: number, idempotencyKey?: string): Wallet {
        const wallet = this.findWalletById(walletId);

        // Idempotency check: If key exists, return the current wallet state without re-funding
        if (idempotencyKey) {
            const existingTx = this.transactionsService.findTransactionByProcessedKey(idempotencyKey);
            if (existingTx && existingTx.walletId === walletId && existingTx.type === 'CREDIT') {
                return wallet;
            }
        }

        // Apply the change
        wallet.balance += amount;
        this.wallets.set(walletId, wallet);

        // Record as CREDIT
        this.transactionsService.recordTransaction(
            walletId,
            'CREDIT',
            amount,
            undefined,
            idempotencyKey,
        );

        return wallet;
    }

    // 3. Transfer Between Wallets
    public transferFunds(
        senderId: string,
        receiverId: string,
        amount: number,
        idempotencyKey?: string,
    ): { sender: Wallet; receiver: Wallet } {
        const sender = this.findWalletById(senderId);
        const receiver = this.findWalletById(receiverId);

        // Idempotency check: If key exists for the sender, assume transfer succeeded and return current states.
        if (idempotencyKey) {
            const existingTx = this.transactionsService.findTransactionByProcessedKey(idempotencyKey);
            if (existingTx && existingTx.walletId === senderId && existingTx.type === 'DEBIT') {
                return { sender, receiver };
            }
        }

        // Handle insufficient balance
        if (sender.balance < amount) {
            throw new InsufficientBalanceException(senderId, amount, sender.balance);
        }

        // DEBIT the sender
        sender.balance -= amount;
        this.wallets.set(senderId, sender);
        this.transactionsService.recordTransaction(
            senderId,
            'DEBIT', // Debit from sender
            amount,
            receiverId,
            idempotencyKey,
        );

        // CREDIT the receiver
        receiver.balance += amount;
        this.wallets.set(receiverId, receiver);
        this.transactionsService.recordTransaction(
            receiverId,
            'CREDIT', // Credit to receiver
            amount,
            senderId,
        );

        return { sender, receiver };
    }
}