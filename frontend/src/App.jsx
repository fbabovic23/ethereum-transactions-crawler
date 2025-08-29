import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers"; // npm i ethers

export default function App() {
  const [address, setAddress] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [transactions, setTransactions] = useState(null);
  const [balance, setBalance] = useState([]);
  const [date, setDate] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState("");

  const keyLabels = {
    ethTxs: "Ethereum Transactions",
    internalTxs: "Internal Ethereum Transactions",
    tokenTxs: "ERC20 Token Transfers",
  };

  const formatValue = (tx, listKey) => {
    if (!tx || tx.value == null) return "-";

    if (listKey === "tokenTxs") {
      const decimals = tx.tokenDecimal ? parseInt(tx.tokenDecimal, 10) : 18;
      try {
        return `${ethers.utils.formatUnits(tx.value.toString(), decimals)} ${tx.tokenSymbol || ""}`;
      } catch {
        return `${Number(tx.value) / Math.pow(10, decimals)} ${tx.tokenSymbol || ""}`;
      }
    }
    try {
      return ethers.utils.formatEther(tx.value.toString());
    } catch {
      return (Number(tx.value) / 1e18).toString();
    }
  };
     const formatTokenBalance = (token) => {
      if (!token || !token.balance) return "0";
      const decimals = token.decimals ?? 18; // fallback to 18 if undefined
      try {
        return Number(ethers.utils.formatUnits(token.balance, decimals)).toString();
      } catch {
        return (Number(token.balance) / Math.pow(10, decimals)).toString();
      }
    };

  const fetchBalance = async () => {
    setError("");
    setBalance([]);

    if (!address.trim()) {
      setError("Please enter a wallet address.");
      return;
    }
    if (date==="") {
      setError("Please enter a date in YYYY-MM-DD format.");
      return;
    }
    setLoadingBalance(true);
    try{
    const res = await axios.get('http://localhost:5001/api/balance',{
      params: {address: address.trim(),  date: date},
    });

    setBalance(res.data || []);

    }
    catch(error){
      console.error(error);
      setError("Failed to check balance. Check your input");
    }
    finally{
      setLoadingBalance(false);
    }
  }



  const fetchTransactions = async () => {
    setError("");
    setTransactions(null);

    if (!address.trim()) {
      setError("Please enter a wallet address.");
      return;
    }
    if (startBlock === "") {
      setError("Please enter a start block.");
      return;
    }

    setLoadingTx(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/transactions`, {
        params: { address: address.trim(), startBlock: Number(startBlock) },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch transactions ");
    } finally {
      setLoadingTx(false);
    }
  };

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ethereum transactions crawler</h1>


      <input
        type="text"
        placeholder="Wallet Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 rounded w-1/2 mb-2 block"
      />
      

      <input
        type="number"
        placeholder="Start Block"
        value={startBlock}
        onChange={(e) => setStartBlock(e.target.value)}
        className="border p-2 rounded w-1/2 mb-2 block"
      />

      <input
        type="text"
        placeholder="Date: YYYY-MM-DD"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-1/2 mb-2 block"
      />
      <button
        onClick={fetchTransactions}
        disabled={loadingTx}
        className={`px-4 py-2 rounded text-white ${loadingTx ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
      >
        {loadingTx ? "Fetching..." : "Check Transactions"}
      </button>

      <button
          onClick={fetchBalance}
          disabled={loadingBalance}
          className={`px-4 py-2 rounded text-white ${loadingBalance ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} ml-2`}
        >
          {loadingBalance ? "Fetching..." : "Check Balance"}
        </button>


      {error && <p className="mt-4 text-red-500">{error}</p>}

      {transactions && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Results</h2>

          {Object.entries(transactions).map(([key, list]) => (
            <div key={key} className="mt-4">
              <h3 className="text-lg font-medium">
                {keyLabels[key] || key } ({Array.isArray(list) ? list.length : 0})
              </h3>

              {!Array.isArray(list) || list.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">No items.</p>
              ) : (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-sm border-collapse border border-gray-300 text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Hash</th>
                        <th className="border border-gray-300 p-2">Block</th>
                        <th className="border border-gray-300 p-2">From</th>
                        <th className="border border-gray-300 p-2">To</th>
                        <th className="border border-gray-300 p-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((tx, i) => (
                        <tr key={`${tx.hash ?? "nohash"}-${i}`} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            <span className="inline-block max-w-[150px] truncate" title={tx.hash}>
                               {tx.hash}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-1">{tx.blockNumber ?? "-"}</td>
                          <td className="border border-gray-300 p-1">{tx.from ?? "-"}</td>
                          <td className="border border-gray-300 p-1">{tx.to ?? "-"}</td>
                          <td className="border border-gray-300 p-1">{formatValue(tx, key)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

  
        {(balance.length>0) && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Token Balances on {date}</h2>

            {balance.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No tokens found at this date.</p>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-sm border-collapse border border-gray-300 text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Name</th>
                      <th className="border border-gray-300 p-2">Symbol</th>
                      <th className="border border-gray-300 p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balance.map((token, i) => (
                      <tr key={`${token.token_address}-${i}`} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2">{token.name || "-"}</td>
                        <td className="border border-gray-300 p-2">{token.symbol || "-"}</td>
                        <td className="border border-gray-300 p-2">
                          {formatTokenBalance(token)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


    </div>
  );
}
