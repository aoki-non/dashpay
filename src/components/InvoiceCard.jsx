import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ArrowRight, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatFiat, formatRelativeTime, truncateAddress } from '../services/formatters';

export function InvoiceCard({ invoice, onSelectInvoice, onOpenReceipt }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}?invoice=${invoice.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Settled on Polygon
          </span>
        );
      case 'PROCESSING':
      case 'KNOWN_DEPOSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Solving / Swapping
          </span>
        );
      case 'QUOTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="h-3 w-3" />
            Quote Generated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            Awaiting Payer
          </span>
        );
    }
  };

  const getCurrencyFlag = (currency) => {
    switch (currency) {
      case 'CRC': return '🇨🇷';
      case 'SVC': return '🇸🇻';
      case 'GMD': return '🇬🇲';
      case 'EUR': return '🇪🇺';
      default: return '💵';
    }
  };

  return (
    <div 
      onClick={() => onSelectInvoice(invoice)}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
    >
      <div>
        {/* Top bar: ID and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{getCurrencyFlag(invoice.fiatCurrency)}</span>
            <span className="font-mono text-xs text-slate-400 font-semibold group-hover:text-indigo-400 transition-colors">
              {invoice.id}
            </span>
          </div>
          {getStatusBadge(invoice.status)}
        </div>

        {/* Amount & Description */}
        <div className="mb-4">
          <div className="text-xl font-bold text-white flex items-baseline gap-2">
            <span>{formatFiat(invoice.fiatAmount, invoice.fiatCurrency)}</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              ({invoice.fiatCurrency})
            </span>
          </div>

          <div className="text-sm font-semibold text-indigo-400 flex items-center gap-1.5 mt-0.5 font-mono">
            <span>Receives: {invoice.usdAmount?.toFixed(2)} {invoice.stablecoin}</span>
            <span className="text-[11px] text-slate-500 font-normal">on Polygon</span>
          </div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-1">
            {invoice.description || 'Order Checkout'}
          </p>
        </div>
      </div>

      {/* Footer Details & Action buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">
          {formatRelativeTime(invoice.createdAt)}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy customer checkout link"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          {invoice.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReceipt(invoice);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Receipt</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectInvoice(invoice)}
              className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Pay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

