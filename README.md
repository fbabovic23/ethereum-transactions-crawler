# Ethereum Transactions Crawler

A full-stack application for tracking Ethereum wallet transactions and historical token balances. Built with React frontend (styled with Tailwind CSS) and Node.js backend, integrating Etherscan and Moralis APIs.

## Features

- **Transaction History**: Fetch and display three types of transactions from any Ethereum address:
  - Regular Ethereum transactions
  - Internal Ethereum transactions
  - ERC-20 token transfers
- **Historical Balance Lookup**: Check token balances for any wallet at a specific date
- **Real-time Data**: Direct integration with Etherscan and Moralis APIs

## Prerequisites

- Node.js (v14 or higher)
- npm 
- API Keys:
  - [Etherscan API Key](https://etherscan.io/apis)
  - [Moralis API Key](https://moralis.io/)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>

```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install express cors axios ethers dotenv dayjs moralis
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install axios ethers
```

If you're setting up a new React project with Tailwind CSS:

```bash
# Create React app (if not already created)
npx create-react-app frontend
cd frontend

# Install required dependencies
npm install axios ethers

# Install and setup Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind directives to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=5001
ETHERSCAN_API_KEY=your_etherscan_api_key_here
MORALIS_API_KEY=your_moralis_api_key_here
```

## Usage

### Starting the Application

1. **Start the Backend Server**:
```bash
cd backend
npm start
```
The server will run on `http://localhost:5001`

2. **Start the Frontend Application**:
```bash
cd frontend
npm start
```
The React app will run on `http://localhost:3000`

### Using the Application

1. **Check Transactions**:
   - Enter a valid Ethereum wallet address
   - Specify a start block number (e.g., 15000000)
   - Click "Check Transactions" to fetch all transactions from that block onwards

2. **Check Historical Balance**:
   - Enter a valid Ethereum wallet address
   - Enter a date in YYYY-MM-DD format (e.g., 2024-01-15)
   - Click "Check Balance" to see all token balances on that date

## API Endpoints

### GET `/api/transactions`
Fetches all transactions for a given address starting from a specific block.

**Query Parameters:**
- `address` (required): Ethereum wallet address
- `startBlock` (required): Block number to start fetching from

**Response:**
```json
{
  "ethTxs": [...],        // Regular ETH transactions
  "internalTxs": [...],   // Internal transactions
  "tokenTxs": [...]       // ERC-20 token transfers
}
```

### GET `/api/balance`
Fetches token balances for a wallet at a specific date.

**Query Parameters:**
- `address` (required): Ethereum wallet address
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
[
  {
    "name": "Token Name",
    "symbol": "TKN",
    "balance": "1000000000000000000",
    "decimals": 18
  }
]
```

## Project Structure

```
ethereum-transactions-crawler/
├── backend/
│   ├── server.js           # Express server with API endpoints
│   ├── package.json
│   └── .env               # Environment variables (not tracked)
├── frontend/
│   ├── src/
│   │   └── App.jsx        # Main React component
│   └── package.json
└── README.md
```

## Key Components

### Backend (server.js)
- Express server with CORS enabled
- Integration with Etherscan API for transaction data
- Integration with Moralis API for historical balance data
- Block number resolution from timestamps
- Error handling and validation

### Frontend (App.jsx)
- React hooks for state management
- Axios for API calls
- Ethers.js for formatting Wei values
- Tailwind CSS for styling
- Responsive table displays with hover effects
- Loading states and error handling

## Technical Details

### Transaction Types
1. **Ethereum Transactions**: Standard ETH transfers between addresses
2. **Internal Transactions**: Transactions triggered by smart contracts
3. **Token Transfers**: ERC-20 tokens

### Value Formatting
- ETH values are converted from Wei using ethers.js
- Token values respect their decimal places (default: 18)
- Graceful fallback for formatting errors

## Security Considerations

- API keys are stored in environment variables
- CORS is configured for the development environment
- No sensitive data is stored client-side

## Troubleshooting

### Common Issues

1. **"Failed to fetch transactions"**
   - Check if your Etherscan API key is valid
   - Verify the wallet address format
   - Ensure the start block is a valid number

2. **"Failed to fetch token balances"**
   - Verify your Moralis API key is set correctly
   - Check the date format (YYYY-MM-DD)
   - Ensure the date is not in the future

3. **CORS errors**
   - Make sure the backend server is running on port 5001
   - Check that the frontend is configured to call the correct backend URL



## Acknowledgments

- [Etherscan](https://etherscan.io/) for blockchain data
- [Moralis](https://moralis.io/) for Web3 infrastructure
- [Ethers.js](https://docs.ethers.io/) for Ethereum interactions
