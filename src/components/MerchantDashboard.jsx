import React, { useState } from 'react';
import { Plus, ArrowUpRight, Coins, ShieldCheck, ExternalLink, Filter, TrendingUp, Layers, CheckCircle2, Wallet, RefreshCw } from 'lucide-react';
import { InvoiceCard } from './InvoiceCard';
import { formatFiat, truncateAddress } from '../services/formatters';

export function MerchantDashboard({
  invoices,
  fxRates,
  merchantAddress,
  polygonUsdtBalance,
  isConnectingWallet,
  onConnectWallet,
  onOpenCreateInvoice,
  onSelectInvoice,
  onOpenReceipt,
  onOpenSettings
}) {
  const [filterCurrency, setFilterCurrency] = useState('ALL');

  const filtered = invoices.filter(inv => {
    if (filterCurrency !== 'ALL' && inv.fiatCurrency !== filterCurrency) return false;
    return true;
  });

  const completedInvoices = invoices.filter(inv => inv.status === 'COMPLETED' || inv.status === 'SUCCESS');
  const totalSettledUsdt = completedInvoices.reduce((sum, inv) => sum + (inv.usdAmount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Nimiq Pay Wallet Status Header */}
      {!merchantAddress ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold mb-2">
              <span>Nimiq Pay Mini-App Integration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Connect Nimiq Pay Wallet
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Connect your Nimiq Pay EVM wallet to receive payments directly in USDT on Polygon (Matic). Your customers can pay with any cryptocurrency on any chain via Aurora Intents.
            </p>
          </div>

          <button
            type="button"
            onClick={onConnectWallet}
            disabled={isConnectingWallet}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] shrink-0"
          >
            {isConnectingWallet ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Nimiq Pay</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono text-slate-300 font-semibold">
                Nimiq Wallet: {truncateAddress(merchantAddress, 6, 6)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Polygon (137)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Multi-Fiat ➔ Polygon USDT POS
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create invoices in Costa Rican / Salvadoran Colones (₡), Gambian Dalasi (D), or Euros (€).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateInvoice}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Metric 1: Nimiq Pay USDT Balance */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Nimiq Pay Polygon USDT</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {polygonUsdtBalance} <span className="text-xs text-slate-400 font-normal">USDT</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Live on-chain balance on Polygon PoS
          </span>
        </div>

        {/* Metric 2: Settled Invoices Volume */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Settled Volume</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${totalSettledUsdt.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {completedInvoices.length} paid out on Polygon
          </span>
        </div>

        {/* Metric 3: Pricing Currencies */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Pricing Currencies</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Coins className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-white mt-0.5">
            <span>🇨🇷 ₡</span>
            <span>🇸🇻 ₡</span>
            <span>🇬🇲 D</span>
            <span>🇪🇺 €</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            CRC, SVC, GMD, and EUR
          </span>
        </div>

      </div>

      {/* Invoices Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">Invoices</h2>
            <p className="text-[11px] text-slate-400">
              Select an invoice to open checkout or share the link with the payer.
            </p>
          </div>

          {/* Filter */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'CRC', 'SVC', 'GMD', 'EUR'].map(cur => (
              <button
                key={cur}
                type="button"
                onClick={() => setFilterCurrency(cur)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterCurrency === cur
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cur === 'ALL' ? 'All' : cur}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <Coins className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-white">No invoices yet</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Create an invoice to receive payments from any chain settling in USDT on Polygon.
            </p>
            <button
              type="button"
              onClick={onOpenCreateInvoice}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onSelectInvoice={onSelectInvoice}
                onOpenReceipt={onOpenReceipt}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
