import React from 'react';
import { ArrowLeftRight, Settings, ExternalLink, ShieldCheck, Zap, Wallet, RefreshCw } from 'lucide-react';
import { truncateAddress } from '../services/formatters';

export function Navbar({
  currentView,
  setCurrentView,
  fxRates,
  merchantAddress,
  polygonUsdtBalance,
  isConnectingWallet,
  onConnectWallet,
  onOpenSettings,
  activeInvoice,
  isNimiqApp
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & DashPay Badge */}
        <div className="flex items-center gap-3">
          <img
            src="/dashpay-logo.png"
            alt="DashPay logo"
            className="h-10 w-10 rounded-xl shadow-lg shadow-amber-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Dash<span className="text-amber-400">Pay</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Mini App
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Multi-Fiat Invoicing ➔ Aurora Intents ➔ USDT on Polygon
            </p>
          </div>
        </div>

        {/* Live FX Ticker (Colones, Dalasi, Euros) */}
        {fxRates && (
          <div className="hidden lg:flex items-center gap-2.5 text-xs bg-slate-950/70 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Rates:
            </span>
            <span className="text-slate-300 font-mono">
              ₡ {Math.round(fxRates.rates?.CRC || 512)} <span className="text-slate-500 text-[10px]">CRC</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">
              D {(fxRates.rates?.GMD || 71).toFixed(1)} <span className="text-slate-500 text-[10px]">GMD</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">
              € {(fxRates.rates?.EUR || 0.92).toFixed(2)} <span className="text-slate-500 text-[10px]">EUR</span>
            </span>
          </div>
        )}

        {/* Wallet & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* View switcher tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentView('merchant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'merchant'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Merchant POS
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('checkout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentView === 'checkout'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pay Invoice</span>
              {activeInvoice && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          </div>

          {/* DashPay Polygon Wallet Connect / Address Badge */}
          {merchantAddress ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Polygon USDT
                </span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {polygonUsdtBalance} USDT
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 font-mono text-slate-300 hover:text-white"
                title="View Polygon Wallet Settings"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>{truncateAddress(merchantAddress, 4, 3)}</span>
                <Settings className="h-3 w-3 text-slate-500 hover:text-white ml-0.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnectWallet}
              disabled={isConnectingWallet}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isConnectingWallet ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
