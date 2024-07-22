// "use client"

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { utils, Wallet,BrowserProvider, Provider} from "zksync-ethers";
// import { getEthersProvider } from './ethers';
// import { Noto_Sans_Tamil_Supplement } from 'next/font/google';
// const CONTRACT_ABI = require('../variables/abi.json')
// const CONTRACT_ADDRESS = require('../variables/address.json')


// const ContractContext = createContext();

// export function ContractProvider({ children }) {

//   const [contract, setContract] = useState(null);
//   const [zkProvider, setZkProvider] = useState(null);

//   useEffect(() => {
//     const init = async()=>{
//       if (typeof window !== 'undefined') {

//       const provider = new BrowserProvider(window.ethereum);
//       await provider.send("eth_requestAccounts", []);
//       const zkProvider = new Provider("https://sepolia.era.zksync.dev")
//       setZkProvider(zkProvider)
//       const signer = await provider.getSigner();
//       const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//       setContract(contractInstance);
//     }
//   }
   
//     init()
//   }, [CONTRACT_ADDRESS, CONTRACT_ABI]);

//   return (
//     <ContractContext.Provider value={{ contract,zkProvider }}>
//       {children}
//     </ContractContext.Provider>
//   );
// }

// export function useContract() {
//   return useContext(ContractContext);
// }