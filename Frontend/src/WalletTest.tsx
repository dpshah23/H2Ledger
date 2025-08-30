import React from "react";
import { useWallet } from "./utils/wallet.ts"; // adjust path

const WalletTest: React.FC = () => {
  const { account, connectWallet } = useWallet();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Wallet Test</h1>

      <button onClick={connectWallet}>
        {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect Wallet"}
      </button>

      {account && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Account:</strong> {account}</p>
        </div>
      )}
    </div>
  );
};

export default WalletTest;
