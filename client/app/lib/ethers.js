// const ethers = require('ethers')
// import { utils, BrowserProvider } from "zksync-ethers";


// export async function getEthersProvider() {
//   // Check if MetaMask is installed and enabled
 
//   if (typeof window !== 'undefined') {
//     // Use MetaMask's injected provider
//     const provider = new BrowserProvider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     return provider
//   } else {
//     // Fall back to a JSON-RPC provider
//     return new ethers.providers.JsonRpcProvider('https://sepolia.era.zksync.dev');
//   }
// }