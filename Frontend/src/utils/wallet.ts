import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./contract.ts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ReturnType<typeof getContract> | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const signer = await _provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setProvider(_provider);

      const _contract = getContract(signer);
      setContract(_contract);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  // Auto-detect account change
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts[0] || null);
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  return { account, provider, contract, connectWallet };
};
