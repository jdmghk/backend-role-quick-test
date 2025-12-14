# Backend Developer Take-Home Test (NestJS)

## Objective
This exercise is designed to assess your ability to structure a NestJS project, design clean APIs, and implement real-world backend logic without overengineering.

We are not looking for perfection — clarity, correctness, and good engineering judgment matter more.

## Tech Stack
- **NestJS**
- **TypeScript**
- In-memory storage or simple database (SQLite / Postgres optional)


## Task
Build a **simple wallet service**.


## Functional Requirements

### 1. Create Wallet
Create an API to create a wallet.

**Wallet fields:**
- `id`
- `currency` (USD)
- `balance`


### 2. Fund Wallet
Create an API to fund a wallet.

- Add a positive amount to the wallet balance
- Validate input


### 3. Transfer Between Wallets
Create an API to transfer funds between wallets.

- Prevent negative balances
- Validate sender and receiver wallets
- Handle insufficient balance errors


### 4. Fetch Wallet Details
Create an API to fetch wallet details.

- Wallet information
- Transaction history


## Validation & Error Handling
- Validate request payloads
- Return meaningful error responses
- Ensure wallet balance integrity


## Nice-to-Have (Optional)
These are optional and will be considered a bonus:

- Idempotency for fund/transfer operations
- Simple unit tests
- Brief notes on how this system would scale in production

## Submission Instructions
Please submit:
- A **GitHub repository link**
- A **README** that includes:
  - Setup instructions
  - Any assumptions made
- Postman Collection with API Endpoints
  - API endpoints


## Time Expectation
- **Estimated effort:** 4–6 hours
- **Deadline:** 24 hours from receiving the test


## Notes
- Focus on clean structure and readability
- Do not overengineer
- In-memory storage is perfectly acceptable
