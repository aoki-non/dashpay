import React, { useState, useMemo } from 'react';
import { Search, Check, Sparkles, Filter, Coins } from 'lucide-react';
import { formatCryptoAmount } from '../services/formatters';

// Popular chains to highlight
const POPULAR_CHAINS = [
  { slug: 'ALL', name: 'All Chains', icon: '🌐' },
  { slug: 'sol', name: 'Solana', icon: '☀️' },
  { slug: 'btc', name: 'Bitcoin', icon: '₿' },
  { slug: 'eth', name: 'Ethereum', icon: 'Ξ' },
  { slug: 'base', name: 'Base', icon: '🔵' },
  { slug: 'pol', name: 'Polygon', icon: '🟣' },
  { slug: 'arb', name: 'Arbitrum', icon: '🔷' },
  { slug: 'bsc', name: 'BNB Chain', icon: '🟡' },
  { slug: 'tron', name: 'TRON', icon: '🔴' },
  { slug: 'near', name: 'NEAR', icon: 'Ⓝ' },
  { slug: 'sui', name: 'Sui', icon: '💧' },
  { slug: 'doge', name: 'Dogecoin', icon: '🐕' }
];

export function TokenChainSelector({
  tokens,
  chains,
  selectedToken,
  onSelectToken,
  targetUsd
}) {
  const [selectedChain, setSelectedChain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tokens based on chain and search query
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      // Chain filter
      if (selectedChain !== 'ALL' && token.blockchain !== selectedChain) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSymbol = token.symbol?.toLowerCase().includes(q);
        const matchesChain = token.chainName?.toLowerCase().includes(q) || token.blockchain?.toLowerCase().includes(q);
        const matchesContract = token.contractAddress?.toLowerCase().includes(q);
        return matchesSymbol || matchesChain || matchesContract;
      }
      return true;
    });
  }, [tokens, selectedChain, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 200+ tokens by symbol (BTC, SOL, ETH, DOGE, PEPE...)"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Popular Chain Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {POPULAR_CHAINS.map(chain => (
          <button
            key={chain.slug}
            type="button"
            onClick={() => setSelectedChain(chain.slug)}
            className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1.5 transition-all text-xs ${
              selectedChain === chain.slug
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            <span>{chain.icon}</span>
            <span>{chain.name}</span>
          </button>
        ))}
      </div>

      {/* Token List */}
      <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
        {filteredTokens.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No tokens match your search filter.
          </div>
        ) : (
          filteredTokens.map(token => {
            const isSelected = selectedToken?.assetId === token.assetId;
            // Estimated token amount needed
            const estTokenAmount = (token.price && token.price > 0 && targetUsd > 0)
              ? (targetUsd / token.price)
              : null;

            return (
              <button
                key={token.assetId}
                type="button"
                onClick={() => onSelectToken(token)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                    : 'border-slate-800/70 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                {/* Left: Token info */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold">
                    {token.chainIcon || '🪙'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white font-mono">{token.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                        {token.chainName || token.blockchain}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ${token.price ? Number(token.price).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '—'}
                    </span>
                  </div>
                </div>

                {/* Right: Est Amount & Selection Check */}
                <div className="flex items-center gap-3 text-right">
                  {estTokenAmount !== null && (
                    <div>
                      <div className="text-xs font-bold font-mono text-indigo-300">
                        ~{formatCryptoAmount(estTokenAmount.toString())} {token.symbol}
                      </div>
                      <span className="text-[10px] text-slate-500">estimated pay</span>
                    </div>
                  )}

                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-700 bg-slate-800 text-transparent'
                  }`}>
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
