"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { utils, Wallet } from "zksync-ethers";
import { getEthersProvider } from './ethers';
import { Noto_Sans_Tamil_Supplement } from 'next/font/google';
const CONTRACT_ABI = require('../variables/abi.json')
const CONTRACT_ADDRESS = require('../variables/address.json')
const private_key = process.env.NEXT_PUBLIC_PRIVATE_KEY


const ContractContext = createContext();

export function ContractProvider({ children }) {

  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(CONTRACT_ADDRESS);
  const [contractAbi, setContractAbi] = useState(CONTRACT_ABI);
  const [wallet, setWallet] = useState(null)

  useEffect(() => {
    if (!contractAddress || !contractAbi) return;

    const provider = getEthersProvider();
    const signer = provider.getSigner();
    const wallet = new Wallet(private_key, provider);
    setWallet(wallet)
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, wallet);
    setContract(contractInstance);
  }, [contractAddress, contractAbi]);

  return (
    <ContractContext.Provider value={{ contract,wallet }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  return useContext(ContractContext);
}