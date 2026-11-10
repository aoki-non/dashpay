import React, { useState } from 'react';

// Community token icon set (Bitcoin, Ethereum, Solana, USDT, …), served over CDN.
const ICON_CDN = 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color';

// Native asset per Aurora chain slug, used for the chain badge.
const CHAIN_NATIVE_SYMBOL = {
  sol: 'sol',
  btc: 'btc',
  eth: 'eth',
  pol: 'matic',
  base: 'eth',
  arb: 'arb',
  bsc: 'bnb',
  near: 'near',
  tron: 'trx',
  sui: 'sui',
  doge: 'doge',
  avax: 'avax',
  op: 'op',
  aptos: 'apt',
  stellar: 'xlm',
  ton: 'ton',
  bch: 'bch',
  ltc: 'ltc',
  xrp: 'xrp',
  cardano: 'ada'
};

function slug(value) {
  return (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Icon URLs to try in order: any image the token API ships first,
// then the community set looked up by symbol.
function tokenIconCandidates(token) {
  const urls = [];
  for (const field of ['icon', 'iconUrl', 'logo', 'logoUrl', 'image', 'imageUrl']) {
    if (token[field]) urls.push(token[field]);
  }
  const symbolSlug = slug(token.symbol);
  if (symbolSlug) urls.push(`${ICON_CDN}/${symbolSlug}.png`);
  return urls;
}

export function TokenIcon({ token, size = 36 }) {
  const [attempt, setAttempt] = useState(0);
  const urls = tokenIconCandidates(token);
  const letter = (token.symbol || '?').trim().slice(0, 1).toUpperCase() || '?';

  if (attempt >= urls.length) {
    return (
      <div
        aria-hidden="true"
        className="rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 shrink-0"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={urls[attempt]}
      alt={`${token.symbol || 'Token'} logo`}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-full shrink-0 bg-slate-800"
      onError={() => setAttempt((n) => n + 1)}
    />
  );
}

export function ChainBadge({ chain }) {
  const symbol = CHAIN_NATIVE_SYMBOL[chain];
  if (!symbol) return null;
  return (
    <img
      src={`${ICON_CDN}/${symbol}.png`}
      alt=""
      aria-hidden="true"
      width={16}
      height={16}
      loading="lazy"
      className="rounded-full bg-slate-950 ring-1 ring-slate-700"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
