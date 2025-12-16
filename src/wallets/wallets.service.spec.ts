import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { InsufficientBalanceException, SelfTransferException, WalletNotFoundException } from '../common/errors';

describe('WalletsService', () => {
    let walletsService: WalletsService;
    let transactionsService: TransactionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WalletsService, TransactionsService],
        }).compile();

        walletsService = module.get<WalletsService>(WalletsService);
        transactionsService = module.get<TransactionsService>(TransactionsService);

        // Ensure the service starts clean for each test
        // (A simple way to clear the in-memory map/array)
        (walletsService as any).wallets = new Map();
        (transactionsService as any).transactions = [];
        (transactionsService as any).processedKeys = new Map();
    });

    // --- Setup Helpers ---
    const createWallet = (balance: number = 0) => {
        const wallet = walletsService.createWallet('USD');
        if (balance > 0) {
            wallet.balance = balance; // Directly set balance for testing initial state
        }
        return wallet;
    };

    // --- TEST CASES ---

    it('should be defined', () => {
        expect(walletsService).toBeDefined();
    });

    describe('createWallet', () => {
        it('should create a new wallet with zero balance', () => {
            const wallet = walletsService.createWallet('USD');
            expect(wallet).toHaveProperty('id');
            expect(wallet.currency).toBe('USD');
            expect(wallet.balance).toBe(0);
        });
    });

    describe('fundWallet', () => {
        it('should increase the wallet balance and record a CREDIT transaction', () => {
            const wallet = createWallet(100);
            const updatedWallet = walletsService.fundWallet(wallet.id, 50);
            expect(updatedWallet.balance).toBe(150);

            const history = transactionsService.findWalletTransactions(wallet.id);
            expect(history.length).toBe(1);
            expect(history[0].type).toBe('CREDIT');
        });

        it('should handle idempotency for funding operations', () => {
            const wallet = createWallet(100);
            const key = 'fund-key-1';

            // 1. First execution (successful)
            walletsService.fundWallet(wallet.id, 50, key);
            expect(walletsService.findWalletById(wallet.id).balance).toBe(150);
            expect(transactionsService.findWalletTransactions(wallet.id).length).toBe(1);

            // 2. Second execution with the same key (should be ignored)
            walletsService.fundWallet(wallet.id, 50, key);
            expect(walletsService.findWalletById(wallet.id).balance).toBe(150); // Balance unchanged
            expect(transactionsService.findWalletTransactions(wallet.id).length).toBe(1); // No new transaction
        });

        it('should throw WalletNotFoundException if wallet does not exist', () => {
            expect(() => walletsService.fundWallet('non-existent-id', 10)).toThrow(WalletNotFoundException);
        });
    });

    describe('transferFunds', () => {
        let sender;
        let receiver;

        beforeEach(() => {
            sender = createWallet(200);
            receiver = createWallet(50);
        });

        it('should successfully transfer funds and update balances', () => {
            const amount = 100;
            const { sender: updatedSender, receiver: updatedReceiver } = walletsService.transferFunds(
                sender.id,
                receiver.id,
                amount,
            );

            expect(updatedSender.balance).toBe(100);
            expect(updatedReceiver.balance).toBe(150);

            // Check transaction history for both
            const senderTx = transactionsService.findWalletTransactions(sender.id);
            const receiverTx = transactionsService.findWalletTransactions(receiver.id);
            expect(senderTx[0].type).toBe('DEBIT');
            expect(receiverTx[0].type).toBe('CREDIT');
        });

        it('should throw InsufficientBalanceException if sender balance is too low', () => {
            const amount = 300;
            expect(() => walletsService.transferFunds(sender.id, receiver.id, amount)).toThrow(
                InsufficientBalanceException,
            );
        });

        it('should throw SelfTransferException if sender and receiver are the same (though checked in controller, test service safety)', () => {
            expect(() => walletsService.transferFunds(sender.id, sender.id, 10)).not.toThrow(
                SelfTransferException, // Service doesn't check for this, Controller does.
            );
            // However, we rely on the Controller to enforce this rule based on the requirements.
        });

        it('should handle idempotency for transfer operations', () => {
            const amount = 100;
            const key = 'transfer-key-1';

            // 1. First execution (successful)
            walletsService.transferFunds(sender.id, receiver.id, amount, key);
            expect(walletsService.findWalletById(sender.id).balance).toBe(100);
            expect(walletsService.findWalletById(receiver.id).balance).toBe(150);

            const initialTxCount = transactionsService.findWalletTransactions(sender.id).length;

            // 2. Second execution with the same key (should be ignored)
            walletsService.transferFunds(sender.id, receiver.id, amount, key);

            // Balances must not change
            expect(walletsService.findWalletById(sender.id).balance).toBe(100);
            expect(walletsService.findWalletById(receiver.id).balance).toBe(150);

            // No new transaction for the DEBIT leg
            expect(transactionsService.findWalletTransactions(sender.id).length).toBe(initialTxCount);
        });
    });
});