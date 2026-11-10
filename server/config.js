import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3001,
  
  // Aurora Intents Configuration
  // API key generated at https://portal.intents.aurora.dev
  AURORA_INTENTS_API_KEY: process.env.AURORA_INTENTS_API_KEY || '',
  
  // Official Aurora Intents API endpoint
  AURORA_INTENTS_OFFICIAL_API: 'https://intents-api.aurora.dev/api',
  
  // Public Defuse/1Click Solver Gateway (used if official key not yet assigned)
  AURORA_INTENTS_PUBLIC_URL: 'https://1click.chaindefuser.com/v0',
  
  // FX Rate API
  FX_RATES_API: 'https://open.er-api.com/v6/latest/USD',

  // Polygon (Matic) Chain Configuration
  POLYGON: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon PoS',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    // USDT on Polygon (used natively by Nimiq Pay)
    usdt: {
      symbol: 'USDT',
      name: 'Tether USD (Polygon)',
      contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      assetId: 'nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr'
    }
  },

  // Supported Fiat Currencies for Merchant Invoicing
  SUPPORTED_FIAT: {
    CRC: {
      code: 'CRC',
      name: 'Costa Rican Colón',
      symbol: '₡',
      flag: '🇨🇷',
      subtext: 'Costa Rica',
      decimals: 0
    },
    SVC: {
      code: 'SVC',
      name: 'Salvadoran Colón',
      symbol: '₡',
      flag: '🇸🇻',
      subtext: 'El Salvador (Statutory 8.75 SVC/USD)',
      decimals: 2,
      fixedRateToUsd: 8.75
    },
    GMD: {
      code: 'GMD',
      name: 'Gambian Dalasi',
      symbol: 'D',
      flag: '🇬🇲',
      subtext: 'The Gambia',
      decimals: 2
    },
    EUR: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      flag: '🇪🇺',
      subtext: 'Eurozone',
      decimals: 2
    }
  }
};
