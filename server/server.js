const axios = require('axios');
const express = require('express');
const ethers= require('ethers');
const cors = require('cors');
require('dotenv').config();
const dayjs = require('dayjs');
const Moralis = require("moralis").default;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const apiKeyEthereum = process.env.ETHERSCAN_API_KEY;
//const alchemyRpcUrl=process.env.ALCHEMY_RPC_URL;

const ethUrl= 'https://api.etherscan.io/api';
Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
//const provider = new ethers.JsonRpcProvider(alchemyRpcUrl);


app.get('/api/transactions', async (req, res) => {
  const { address, startBlock} = req.query;

  if (!address || !startBlock) {
    return res.status(400).json({ error: 'address and startBlock are required' });
  }

  try {
    // Normal ETH transfers
    const txUrl = `${ethUrl}?module=account&action=txlist&address=${address}`
      + `&startblock=${startBlock}&sort=asc&apikey=${apiKeyEthereum}`;
    const txResp = await axios.get(txUrl);   
    const ethTxs = txResp.data.result; 

    // Internal transactions
    const internalUrl = `${ethUrl}?module=account&action=txlistinternal&address=${address}`
      + `&startblock=${startBlock}&sort=asc&apikey=${apiKeyEthereum}`;
    const internalResp = await axios.get(internalUrl);
    const internalTxs = internalResp.data.result;

    // ERC-20 token transfers
    const tokenUrl = `${ethUrl}?module=account&action=tokentx&address=${address}`
      + `&startblock=${startBlock}&sort=asc&apikey=${apiKeyEthereum}`;
    const tokenResp = await axios.get(tokenUrl);
    const tokenTxs = tokenResp.data.result;

    res.json({ ethTxs, internalTxs, tokenTxs });

  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
app.get('/api/balance', async (req, res) => {
  const { date, address } = req.query;
  console.log('>> /api/balance called', { address, date });

  if (!date || !address?.trim() || !dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Provide address and date in YYYY-MM-DD format' });
  }

  try {
    const unixTimestamp = Math.floor(new Date(date).getTime() / 1000);
    const blockUrl = `${ethUrl}?module=block&action=getblocknobytime&timestamp=${unixTimestamp}`
        + `&closest=before&apikey=${apiKeyEthereum}`;
    console.log('blockUrl:', blockUrl);

    const blockResp = await axios.get(blockUrl);
  
    const block = Number(blockResp.data.result);
    console.log('Resolved block:', block);

    if (!process.env.MORALIS_API_KEY) console.warn('MORALIS_API_KEY is not set in env');

    const moralisResp = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: "0x1",
      toBlock: block,
      address: address
    });

    const payload = moralisResp?.result ?? (typeof moralisResp.toJSON === 'function' ? moralisResp.toJSON() : moralisResp);
    console.log('moralisResp (preview):', JSON.stringify(payload).slice(0,2000));

    return res.json(payload);
  } catch (error) {
    console.error('Error fetching token balances:', error.response?.data ?? error.message);
    return res.status(500).json({ error: 'Failed to fetch token balances', details: error.response?.data ?? error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
