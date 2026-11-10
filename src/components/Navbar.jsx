import React from 'react';
import { ArrowLeftRight, Settings, ExternalLink, ShieldCheck, Zap, Coins } from 'lucide-react';
import { truncateAddress } from '../services/formatters';

export function Navbar({
  currentView,
  setCurrentView,
  fxRates,
  merchantConfig,
  onOpenSettings,
  activeInvoice
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">Dash<span className="text-indigo-400">Pay</span></span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Aurora Intents
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Multi-Fiat Invoicing ➔ Cross-Chain Deposits ➔ Polygon Settlement
            </p>
          </div>
        </div>

        {/* Live FX Ticker (Colones, Dalasi, Euros) */}
        {fxRates && (
          <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live FX:
            </span>
            <span className="text-slate-300 font-mono">
              ₡ {Math.round(fxRates.rates?.CRC || 512)} <span className="text-slate-500">CRC</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">
              D {(fxRates.rates?.GMD || 71).toFixed(1)} <span className="text-slate-500">GMD</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">
              € {(fxRates.rates?.EUR || 0.92).toFixed(2)} <span className="text-slate-500">EUR</span>
            </span>
            <span className="text-slate-500 text-[10px]">/ $1 USD</span>
          </div>
        )}

        {/* View Switcher & Merchant Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentView('merchant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'merchant'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Merchant Portal
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('checkout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'checkout'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Customer Checkout</span>
              {activeInvoice && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          </div>

          {/* Polygon Destination Badge & Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-700/60 transition-colors"
            title="Merchant Polygon Payout Settings"
          >
            <span className="h-2 w-2 rounded-full bg-purple-400"></span>
            <span className="hidden sm:inline font-mono">Polygon: {truncateAddress(merchantConfig.polygonAddress, 4, 3)}</span>
            <span className="sm:hidden font-mono">Polygon</span>
            <Settings className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </button>

        </div>
      </div>
    </header>
  );
}
