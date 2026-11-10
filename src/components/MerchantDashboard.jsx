import React, { useState } from 'react';
import { Plus, ArrowUpRight, Coins, ShieldCheck, ExternalLink, Filter, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { InvoiceCard } from './InvoiceCard';
import { formatFiat, truncateAddress } from '../services/formatters';

export function MerchantDashboard({
  invoices,
  fxRates,
  merchantConfig,
  onOpenCreateInvoice,
  onSelectInvoice,
  onOpenReceipt
}) {
  const [filterCurrency, setFilterCurrency] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filter invoices
  const filtered = invoices.filter(inv => {
    if (filterCurrency !== 'ALL' && inv.fiatCurrency !== filterCurrency) return false;
    if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
    return true;
  });

  // Calculate stats
  const completedInvoices = invoices.filter(inv => inv.status === 'COMPLETED');
  const totalVolumeUsd = completedInvoices.reduce((sum, inv) => sum + (inv.usdAmount || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gateway Ready • Direct Aurora Intents Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Accept Any Token. Settle Stablecoins on Polygon.
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Price your goods or services in <strong className="text-white">Costa Rican Colones (₡)</strong>, <strong className="text-white">Gambian Dalasi (D)</strong> or <strong className="text-white">Euros (€)</strong>. Payers can send BTC, SOL, ETH, or 200+ tokens from 35+ chains — you receive guaranteed <strong className="text-indigo-400">USDC or USDT on Polygon</strong>.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onOpenCreateInvoice}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Background glow decoration */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Volume Settled */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Settled Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ${totalVolumeUsd.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">USDC/USDT</span>
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            {completedInvoices.length} paid out on Polygon
          </span>
        </div>

        {/* Metric 2: Total Invoices */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Invoices</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {invoices.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across 4 fiat currencies
          </span>
        </div>

        {/* Metric 3: Supported Currencies */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pricing Currencies</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-lg font-bold text-white mt-1">
            <span>🇨🇷 ₡</span>
            <span>🇸🇻 ₡</span>
            <span>🇬🇲 D</span>
            <span>🇪🇺 €</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            CRC, SVC, GMD & EUR supported
          </span>
        </div>

        {/* Metric 4: Payout Destination */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Payout Destination</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">
            {truncateAddress(merchantConfig.polygonAddress, 6, 6)}
          </div>
          <a
            href={`https://polygonscan.com/address/${merchantConfig.polygonAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 font-medium"
          >
            <span>Polygonscan (Chain 137)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

      </div>

      {/* Filter and Invoices List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Merchant Invoices</h2>
            <p className="text-xs text-slate-400">
              Select any invoice to test the customer checkout and cross-chain payment flow.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Currency Filter */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'CRC', 'SVC', 'GMD', 'EUR'].map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setFilterCurrency(cur)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterCurrency === cur
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur === 'ALL' ? 'All' : cur}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="QUOTED">Quoted</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Settled</option>
            </select>

          </div>
        </div>

        {/* Invoice Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <Coins className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No invoices found</h3>
            <p className="text-xs text-slate-400 mt-1">Create an invoice in Colones, Dalasi or Euros to get started.</p>
            <button
              type="button"
              onClick={onOpenCreateInvoice}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
