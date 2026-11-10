import { CONFIG } from '../config.js';

let cachedTokens = null;
let lastTokensFetchedAt = 0;
const TOKENS_CACHE_TTL = 15 * 60 * 1000; // 15 mins

// Chain metadata for UI display
export const CHAIN_METADATA = {
  sol: { name: 'Solana', icon: '☀️', explorer: 'https://solscan.io/tx/' },
  btc: { name: 'Bitcoin', icon: '₿', explorer: 'https://mempool.space/tx/' },
  eth: { name: 'Ethereum', icon: 'Ξ', explorer: 'https://etherscan.io/tx/' },
  pol: { name: 'Polygon', icon: '🟣', explorer: 'https://polygonscan.com/tx/' },
  base: { name: 'Base', icon: '🔵', explorer: 'https://basescan.org/tx/' },
  arb: { name: 'Arbitrum', icon: '🔷', explorer: 'https://arbiscan.io/tx/' },
  bsc: { name: 'BNB Chain', icon: '🟡', explorer: 'https://bscscan.com/tx/' },
  near: { name: 'NEAR Protocol', icon: 'Ⓝ', explorer: 'https://nearblocks.io/txns/' },
  tron: { name: 'TRON', icon: '🔴', explorer: 'https://tronscan.org/#/transaction/' },
  sui: { name: 'Sui', icon: '💧', explorer: 'https://suiscan.xyz/mainnet/tx/' },
  doge: { name: 'Dogecoin', icon: '🐕', explorer: 'https://dogechain.info/tx/' },
  avax: { name: 'Avalanche', icon: '🔺', explorer: 'https://snowtrace.io/tx/' },
  op: { name: 'Optimism', icon: '🔴', explorer: 'https://optimistic.etherscan.io/tx/' },
  aptos: { name: 'Aptos', icon: '⚡', explorer: 'https://explorer.aptoslabs.com/txn/' },
  stellar: { name: 'Stellar', icon: '🚀', explorer: 'https://stellarchain.io/tx/' },
  ton: { name: 'TON', icon: '💎', explorer: 'https://tonviewer.com/transaction/' },
  bch: { name: 'Bitcoin Cash', icon: '🟢', explorer: 'https://blockchair.com/bitcoin-cash/transaction/' },
  ltc: { name: 'Litecoin', icon: '🪙', explorer: 'https://blockchair.com/litecoin/transaction/' },
  xrp: { name: 'XRP Ledger', icon: '✕', explorer: 'https://xrpscan.com/tx/' },
  cardano: { name: 'Cardano', icon: '₳', explorer: 'https://cardanoscan.io/transaction/' },
  monad: { name: 'Monad', icon: '🟣', explorer: 'https://monadexplorer.com/tx/' }
};

/**
 * Fetch supported cross-chain tokens from Aurora Intents / 1Click API
 */
export async function getSupportedTokens(apiKey = '') {
  const now = Date.now();
  if (cachedTokens && (now - lastTokensFetchedAt) < TOKENS_CACHE_TTL && !apiKey) {
    return cachedTokens;
  }

  try {
    let url = `${CONFIG.AURORA_INTENTS_URL}/tokens`;
    if (apiKey) {
      url = `${CONFIG.AURORA_INTENTS_OFFICIAL_API}/tokens/${apiKey}`;
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'DashPay-Merchant-Gateway/1.0' }
    });

    if (!res.ok) {
      throw new Error(`Token fetch failed with status ${res.status}`);
    }

    const rawData = await res.json();
    // 1Click returns array directly, official Intents API returns { tokens: [...] }
    const tokenList = Array.isArray(rawData) ? rawData : (rawData.tokens || []);

    const enrichedTokens = tokenList.map(t => {
      const chainInfo = CHAIN_METADATA[t.blockchain] || {
        name: t.blockchain ? t.blockchain.toUpperCase() : 'Chain',
        icon: '⛓️',
        explorer: ''
      };

      const isPolygonStablecoin = t.blockchain === 'pol' && (t.symbol === 'USDC' || t.symbol === 'USDT');

      return {
        ...t,
        chainName: chainInfo.name,
        chainIcon: chainInfo.icon,
        explorerUrl: chainInfo.explorer,
        isPolygonStablecoin
      };
    });

    // Unique blockchains
    const chainsMap = {};
    for (const t of enrichedTokens) {
      if (!chainsMap[t.blockchain]) {
        chainsMap[t.blockchain] = {
          slug: t.blockchain,
          name: t.chainName,
          icon: t.chainIcon,
          tokenCount: 0
        };
      }
      chainsMap[t.blockchain].tokenCount++;
    }

    const result = {
      tokens: enrichedTokens,
      chains: Object.values(chainsMap).sort((a, b) => b.tokenCount - a.tokenCount),
      polygonStablecoins: enrichedTokens.filter(t => t.isPolygonStablecoin),
      timestamp: now
    };

    if (!apiKey) {
      cachedTokens = result;
      lastTokensFetchedAt = now;
    }

    return result;
  } catch (err) {
    console.error('Error fetching supported tokens from Aurora Intents:', err);
    if (cachedTokens) return cachedTokens;
    throw err;
  }
}

/**
 * Request an EXACT_OUTPUT quote from Aurora Intents / 1Click.
 * The destination amount is fixed to the merchant's stablecoin invoice amount on Polygon.
 */
export async function requestQuote({
  originAsset,
  destinationAsset,
  amount, // Smallest unit of destination asset (e.g. 1000000 for 1 USDC)
  recipient, // Merchant Polygon address
  refundTo,  // Payer refund address
  slippageTolerance = 100, // 1%
  apiKey = '',
  dry = false
}) {
  if (!originAsset || !destinationAsset || !amount || !recipient || !refundTo) {
    throw new Error('Missing required quote parameters (originAsset, destinationAsset, amount, recipient, refundTo)');
  }

  // Quote deadline: 15 minutes from now
  const deadline = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const payload = {
    dry,
    swapType: 'EXACT_OUTPUT',
    depositType: 'ORIGIN_CHAIN',
    originAsset,
    destinationAsset,
    amount: amount.toString(),
    recipient,
    recipientType: 'DESTINATION_CHAIN',
    refundTo,
    refundType: 'ORIGIN_CHAIN',
    slippageTolerance: Number(slippageTolerance),
    deadline
  };

  let quoteUrl = `${CONFIG.AURORA_INTENTS_URL}/quote`;
  if (apiKey) {
    quoteUrl = `${CONFIG.AURORA_INTENTS_OFFICIAL_API}/quote/${apiKey}`;
  }

  const res = await fetch(quoteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DashPay-Merchant-Gateway/1.0',
      'x-aurora-product': 'ic'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Aurora Intents quote error:', res.status, errorBody);
    let parsedMsg = errorBody;
    try {
      const jsonErr = JSON.parse(errorBody);
      parsedMsg = jsonErr.message || errorBody;
    } catch {}
    throw new Error(`Quote request failed (${res.status}): ${parsedMsg}`);
  }

  const quoteData = await res.json();
  return {
    ...quoteData,
    destinationChain: 'Polygon',
    destinationChainId: 137
  };
}

/**
 * Query swap execution status using the unique deposit address
 */
export async function getSwapStatus(depositAddress, depositMemo = null, apiKey = '') {
  if (!depositAddress) {
    throw new Error('depositAddress is required');
  }

  let statusUrl = `${CONFIG.AURORA_INTENTS_URL}/status?depositAddress=${encodeURIComponent(depositAddress)}`;
  if (depositMemo) {
    statusUrl += `&depositMemo=${encodeURIComponent(depositMemo)}`;
  }

  if (apiKey) {
    statusUrl = `${CONFIG.AURORA_INTENTS_OFFICIAL_API}/status/${apiKey}?depositAddress=${encodeURIComponent(depositAddress)}`;
    if (depositMemo) {
      statusUrl += `&depositMemo=${encodeURIComponent(depositMemo)}`;
    }
  }

  const res = await fetch(statusUrl, {
    headers: { 'User-Agent': 'DashPay-Merchant-Gateway/1.0' }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Status query failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data;
}
