import React from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { truncateAddress } from '../services/formatters';

export function MobileHeader({
  merchantAddress,
  polygonUsdtBalance,
  onConnectWallet,
  isConnectingWallet,
  onOpenSettings
}) {
  return (
    <header className="sticky top-0 z-30 max-w-sm mx-auto w-full px-3 py-2.5 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 flex items-center justify-between">
      
      {/* Brand */}
      <div className="flex items-center gap-2">
        <img
          src="/dashpay-logo.png"
          alt="DashPay logo"
          className="h-8 w-8 rounded-xl shadow-md shadow-amber-500/20"
        />
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-sm text-white tracking-tight">
              Dash<span className="text-amber-400">Pay</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Mini App
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Polygon USDT Settlement
          </span>
        </div>
      </div>

      {/* Wallet Status */}
      <div>
        {merchantAddress ? (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-left transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <div className="text-[9px] text-slate-400 font-mono leading-none">
                {truncateAddress(merchantAddress, 4, 3)}
              </div>
              <div className="text-[11px] font-mono font-black text-emerald-400 leading-tight">
                {polygonUsdtBalance} <span className="text-[9px] font-normal text-slate-400">USDT</span>
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnectWallet}
            disabled={isConnectingWallet}
            className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm"
          >
            {isConnectingWallet ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Wallet className="h-3 w-3" />}
            <span>Connect</span>
          </button>
        )}
      </div>

    </header>
  );
}

