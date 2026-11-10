import { encodeFunctionData, formatUnits } from 'viem';
import { init as initNimiqSdk } from '@nimiq/mini-app-sdk';

export const POLYGON_CHAIN_ID_HEX = '0x89'; // 137
export const USDT_POLYGON_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

const ERC20_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

/**
 * Initialize Nimiq Mini App SDK & detect environment
 */
export async function initNimiqEnvironment() {
  let isNimiqPay = false;
  let nimiqSdk = null;

  try {
    nimiqSdk = await initNimiqSdk();
    isNimiqPay = Boolean(window.nimiqPay || window.ethereum?.isNimiq);
  } catch (err) {
    // If not running inside Nimiq Pay WebView, standard browser applies
    isNimiqPay = Boolean(window.ethereum);
  }

  return {
    isNimiqPay,
    nimiqSdk,
    language: window.nimiqPay?.language || navigator.language?.split('-')[0] || 'en'
  };
}

/**
 * Connect to Nimiq Pay / EVM wallet and get Polygon address
 */
export async function connectNimiqEvmWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No EVM wallet detected. Run inside Nimiq Pay app or use an injected Web3 wallet (MetaMask).');
  }

  // 1. Request accounts
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts authorized in wallet.');
  }

  const userAddress = accounts[0];

  // 2. Ensure active chain is Polygon (0x89)
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID_HEX }]
    });
  } catch (switchError) {
    // Error 4902 means the chain has not been added to MetaMask yet
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: POLYGON_CHAIN_ID_HEX,
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }
        ]
      });
    }
  }

  return userAddress;
}

/**
 * Read the merchant's live USDT balance on Polygon (Matic)
 * @param {string} userAddress - EVM Polygon address
 * @returns {Promise<string>} - Human-readable USDT balance (e.g. "124.50")
 */
export async function getPolygonUsdtBalance(userAddress) {
  if (!userAddress || typeof window === 'undefined' || !window.ethereum) {
    return '0.00';
  }

  try {
    const data = encodeFunctionData({
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [userAddress]
    });

    const rawBalance = await window.ethereum.request({
      method: 'eth_call',
      params: [
        {
          to: USDT_POLYGON_ADDRESS,
          data
        },
        'latest'
      ]
    });

    if (!rawBalance || rawBalance === '0x') return '0.00';

    // USDT has 6 decimals on Polygon
    const formatted = formatUnits(BigInt(rawBalance), 6);
    return Number(formatted).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (err) {
    console.warn('Could not read Polygon USDT balance:', err.message);
    return '0.00';
  }
}

