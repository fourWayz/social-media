const ethers = require('ethers')

export function getEthersProvider() {
  // Check if MetaMask is installed and enabled
 
  if (typeof window !== 'undefined') {
    // Use MetaMask's injected provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider
  } else {
    // Fall back to a JSON-RPC provider
    return new ethers.providers.JsonRpcProvider('https://sepolia.era.zksync.dev');
  }
}