import { CONFIG } from '../config.js';

let cachedTokens = null;
let lastTokensFetchedAt = 0;
const TOKENS_CACHE_TTL = 15 * 60 * 1000;

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

function resolveApiKey(customKey) {
  return (customKey || CONFIG.AURORA_INTENTS_API_KEY || '').trim();
}

// Never print a full API key to the logs.
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length <= 8) return '****';
  return `****${apiKey.slice(-4)}`;
}

/**
 * Fetch supported tokens from Aurora Intents
 */
export async function getSupportedTokens(customKey = '') {
  const now = Date.now();
  const apiKey = resolveApiKey(customKey);

  if (cachedTokens && (now - lastTokensFetchedAt) < TOKENS_CACHE_TTL && !apiKey) {
    return cachedTokens;
  }

  try {
    let url = `${CONFIG.AURORA_INTENTS_PUBLIC_URL}/tokens`;
    if (apiKey) {
      url = `${CONFIG.AURORA_INTENTS_OFFICIAL_API}/tokens/${apiKey}`;
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'DashPay-AuroraIntents/1.0' }
    });

    if (!res.ok) {
      // If portal key fails (e.g. 404), fall back to public solver URL
      if (apiKey) {
        console.warn(`Aurora Intents API key ${maskApiKey(apiKey)} returned ${res.status}. Falling back to public solver endpoint.`);
        url = `${CONFIG.AURORA_INTENTS_PUBLIC_URL}/tokens`;
        const fallbackRes = await fetch(url, { headers: { 'User-Agent': 'DashPay-AuroraIntents/1.0' } });
        if (!fallbackRes.ok) throw new Error(`Tokens API failed with ${fallbackRes.status}`);
        var rawData = await fallbackRes.json();
      } else {
        throw new Error(`Tokens API failed with ${res.status}`);
      }
    } else {
      var rawData = await res.json();
    }

    const tokenList = Array.isArray(rawData) ? rawData : (rawData.tokens || []);

    const enrichedTokens = tokenList.map(t => {
      const chainInfo = CHAIN_METADATA[t.blockchain] || {
        name: t.blockchain ? t.blockchain.toUpperCase() : 'Chain',
        icon: '⛓️',
        explorer: ''
      };

      const isPolygonUsdt = t.blockchain === 'pol' && t.symbol === 'USDT';

      return {
        ...t,
        chainName: chainInfo.name,
        chainIcon: chainInfo.icon,
        explorerUrl: chainInfo.explorer,
        isPolygonUsdt
      };
    });

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
      polygonUsdt: enrichedTokens.find(t => t.isPolygonUsdt) || null,
      usingOfficialKey: Boolean(apiKey),
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
 * Request cross-chain EXACT_OUTPUT quote targeting USDT on Polygon
 */
export async function requestQuote({
  originAsset,
  destinationAsset = CONFIG.POLYGON.usdt.assetId,
  amount, // Smallest unit of USDT on Polygon (6 decimals, e.g. 5000000 for 5 USDT)
  recipient, // Merchant DashPay Polygon address
  refundTo,  // Payer origin chain address
  slippageTolerance = 100, // 1%
  apiKey: customKey = '',
  dry = false
}) {
  if (!originAsset) throw new Error('originAsset is required');
  if (!recipient) throw new Error('recipient (merchant Polygon address) is required');
  if (!refundTo) throw new Error('refundTo (payer refund address) is required');
  if (!amount) throw new Error('amount in smallest unit is required');

  const apiKey = resolveApiKey(customKey);
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

  let quoteUrl = `${CONFIG.AURORA_INTENTS_PUBLIC_URL}/quote`;
  if (apiKey) {
    quoteUrl = `${CONFIG.AURORA_INTENTS_OFFICIAL_API}/quote/${apiKey}`;
  }

  let res = await fetch(quoteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DashPay-AuroraIntents/1.0',
      'x-aurora-product': 'ic'
    },
    body: JSON.stringify(payload)
  });

  // If official portal key returns 404/401, fallback to public solver URL
  if (!res.ok && apiKey && (res.status === 404 || res.status === 401)) {
    console.warn(`Aurora Intents official endpoint returned ${res.status} for key ${maskApiKey(apiKey)}. Retrying via public solver gateway.`);
    quoteUrl = `${CONFIG.AURORA_INTENTS_PUBLIC_URL}/quote`;
    res = await fetch(quoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DashPay-AuroraIntents/1.0',
        'x-aurora-product': 'ic'
      },
      body: JSON.stringify(payload)
    });
  }

  if (!res.ok) {
    const errorBody = await res.text();
    let message = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || errorBody;
    } catch {}
    throw new Error(`Quote failed (${res.status}): ${message}`);
  }

  const quoteData = await res.json();
  return {
    ...quoteData,
    destinationChain: 'Polygon',
    destinationChainId: 137,
    destinationToken: 'USDT',
    destinationContract: CONFIG.POLYGON.usdt.contractAddress
  };
}

/**
 * Check execution status of a swap using the unique deposit address
 */
export async function getSwapStatus(depositAddress, depositMemo = null, customKey = '') {
  if (!depositAddress) throw new Error('depositAddress is required');

  const apiKey = resolveApiKey(customKey);
  let statusUrl = `${CONFIG.AURORA_INTENTS_PUBLIC_URL}/status?depositAddress=${encodeURIComponent(depositAddress)}`;
  if (depositMemo) statusUrl += `&depositMemo=${encodeURIComponent(depositMemo)}`;

  if (apiKey) {
    statusUrl = `${CONFIG.AURORA_INTENTS_OFFICIAL_API}/status/${apiKey}?depositAddress=${encodeURIComponent(depositAddress)}`;
    if (depositMemo) statusUrl += `&depositMemo=${encodeURIComponent(depositMemo)}`;
  }

  let res = await fetch(statusUrl, {
    headers: { 'User-Agent': 'DashPay-AuroraIntents/1.0' }
  });

  if (!res.ok && apiKey && (res.status === 404 || res.status === 401)) {
    statusUrl = `${CONFIG.AURORA_INTENTS_PUBLIC_URL}/status?depositAddress=${encodeURIComponent(depositAddress)}`;
    if (depositMemo) statusUrl += `&depositMemo=${encodeURIComponent(depositMemo)}`;
    res = await fetch(statusUrl, { headers: { 'User-Agent': 'DashPay-AuroraIntents/1.0' } });
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Status check failed (${res.status}): ${errText}`);
  }

  return res.json();
}
