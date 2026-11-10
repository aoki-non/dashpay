import React, { useState } from 'react';
import { Wallet, ShieldCheck, ExternalLink, Check, Copy, RefreshCw } from 'lucide-react';
import { truncateAddress, copyTextToClipboard } from '../services/formatters';

export function SettingsScreen({
  merchantAddress,
  polygonUsdtBalance,
  onConnectWallet,
  isConnectingWallet
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!merchantAddress) return;
    const ok = await copyTextToClipboard(merchantAddress);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-sm mx-auto w-full px-2 space-y-4 pb-8 text-xs">
      
      {/* Wallet Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-amber-400" />
            <span>DashPay Wallet (Polygon)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
            Chain 137
          </span>
        </div>

        {merchantAddress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-mono text-xs text-white">
                {truncateAddress(merchantAddress, 10, 8)}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Polygon USDT Balance:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {polygonUsdtBalance} USDT
              </span>
            </div>

            <a
              href={`https://polygonscan.com/address/${merchantAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 pt-1 font-semibold"
            >
              <span>View Wallet on Polygonscan</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="text-center py-2">
            <button
              type="button"
              onClick={onConnectWallet}
              disabled={isConnectingWallet}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              {isConnectingWallet ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
              <span>Connect Wallet</span>
            </button>
          </div>
        )}
      </div>

      {/* Settlement Token Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
          Settlement Specifications
        </span>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span>Asset</span>
            <span className="font-bold text-white font-mono">Tether USD (USDT)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span>Contract</span>
            <span className="font-mono text-slate-300">0xc2132D...8e8F</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Decimals</span>
            <span className="font-mono text-white">6</span>
          </div>
        </div>
      </div>

    </div>
  );
}

