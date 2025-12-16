# 🏦 NestJS Wallet Service Take-Home Test

This project implements a simple wallet service API using NestJS and TypeScript, focusing on clean architecture, robust transaction management, and error handling.

## 1. Setup Instructions

### Prerequisites

* Node.js (LTS version)
* npm (or yarn)
* NestJS CLI (optional, but recommended for development)

### Installation and Running

1.  **Clone the Repository:**
    ```bash
    git clone 
    cd backend-role-quick-test
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    (This includes `class-validator`, `uuid`, and NestJS core dependencies).

3.  **Run the Application:**
    ```bash
    npm run start:dev
    ```
    The application will be running on `http://localhost:3000`.

4.  **Run Unit Tests:**
    ```bash
    npm run test
    ```

### API Endpoints (Postman Collection Required)

| Method | Endpoint | Description | Body | Headers |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/wallets` | Creates a new wallet. | `{"currency": "USD"}` | N/A |
| **PATCH** | `/wallets/:id/fund` | Adds funds to a wallet. | `{"amount": 50.00}` | `Idempotency-Key` (UUID) |
| **POST** | `/wallets/:id/transfer` | Transfers funds from `:id` to `receiverId`. | `{"receiverId": "uuid", "amount": 10.00}` | `Idempotency-Key` (UUID) |
| **GET** | `/wallets/:id` | Fetches wallet details and transaction history. | N/A | N/A |

---

## 2. Assumptions Made

1.  **Data Storage:** An **in-memory `Map`** is used for persistence in the `WalletsService` and `TransactionsService`. **All data is ephemeral** and lost upon server restart, satisfying the test requirement for simplicity.
2.  **Currency:** The system is strictly hardcoded to only accept and transact in `'USD'`.
3.  **Balance Accuracy:** Standard JavaScript `number` (float) is used for balances. In a production financial system, balances would be stored as **integers (cents)** to prevent floating-point arithmetic errors.
4.  **Transaction Types:** Simplified to only **`CREDIT`** (for funding/receiving) and **`DEBIT`** (for spending/sending).
5.  **Idempotency Key:** The client is expected to provide a unique UUID in the `Idempotency-Key` header for `fund` and `transfer` operations. This key prevents the same operation from being processed more than once. The check relies on the `DEBIT` transaction for transfers to mark the operation as complete.

---

## 3. Notes on Scaling in Production

To transition this service from a simple test environment to a reliable, scalable production system, the following areas must be addressed:

| Scaling Area | Improvement Strategy |
| :--- | :--- |
| **Data Persistence** | Replace in-memory storage with a relational database (e.g., **PostgreSQL**). This ensures data durability, indexing for fast lookups, and transactional integrity. |
| **Concurrency & Atomicity** | The most critical change: Every `transferFunds` operation **must** be wrapped in a **database transaction**. This guarantees that the debit and credit operations are atomic (all-or-nothing), preventing race conditions and maintaining balance integrity under high load. |
| **Source of Truth** | Treat the `Transaction` records (the Ledger) as the single source of truth. The `Wallet.balance` should ideally be a **cached/derived** value, calculated from summing the ledger entries. This protects against a single balance field corruption. |
| **Idempotency** | The `processedKeys` map must be replaced by a dedicated **`idempotency_keys` table** in the database, allowing concurrent workers to quickly check and lock the key before processing the financial operation. |
| **Architecture** | For high-traffic financial applications, consider adopting a **CQRS (Command Query Responsibility Segregation)** pattern, separating read/query operations (fetching balances) from write/command operations (transfers, funding). |