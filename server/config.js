export const CONFIG = {
  PORT: process.env.PORT || 3001,
  // 1Click / Aurora Intents public endpoint
  AURORA_INTENTS_URL: process.env.AURORA_INTENTS_URL || 'https://1click.chaindefuser.com/v0',
  // Official Aurora Intents API endpoint (if using merchant custom API key)
  AURORA_INTENTS_OFFICIAL_API: 'https://intents-api.aurora.dev/api',
  // FX Rate API
  FX_RATES_API: 'https://open.er-api.com/v6/latest/USD',
  // Default Merchant Settings
  DEFAULT_MERCHANT: {
    id: 'merchant_001',
    name: 'San José Gourmet & Crafts',
    polygonAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Polygon PoS EVM address
    defaultStablecoin: 'USDC', // USDC or USDT on Polygon
    auroraApiKey: '' // Optional custom Aurora API key from portal.intents.aurora.dev
  },
  // Supported Polygon Stablecoins
  POLYGON_STABLECOINS: {
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin (Polygon)',
      assetId: 'nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L',
      contractAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      blockchain: 'pol',
      chainId: 137,
      explorerUrl: 'https://polygonscan.com/token/0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD (Polygon)',
      assetId: 'nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr',
      contractAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      decimals: 6,
      blockchain: 'pol',
      chainId: 137,
      explorerUrl: 'https://polygonscan.com/token/0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
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
      decimals: 0,
      format: (val) => `₡ ${Number(val).toLocaleString('en-US')}`
    },
    SVC: {
      code: 'SVC',
      name: 'Salvadoran Colón',
      symbol: '₡',
      flag: '🇸🇻',
      subtext: 'El Salvador (Fixed 8.75 SVC/USD)',
      decimals: 2,
      fixedRateToUsd: 8.75, // Historical statutory peg
      format: (val) => `₡ ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    GMD: {
      code: 'GMD',
      name: 'Gambian Dalasi',
      symbol: 'D',
      flag: '🇬🇲',
      subtext: 'The Gambia',
      decimals: 2,
      format: (val) => `D ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    EUR: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      flag: '🇪🇺',
      subtext: 'European Union',
      decimals: 2,
      format: (val) => `€ ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }
};
