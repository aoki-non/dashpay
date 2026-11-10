import React from 'react';
import { Clock, CheckCircle2, RefreshCw, ChevronRight, Coins } from 'lucide-react';
import { formatFiat, formatRelativeTime, truncateAddress } from '../services/formatters';

export function ActivityScreen({ invoices, onSelectInvoice, onOpenReceipt }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-16 text-center max-w-sm mx-auto px-4">
        <div className="h-16 w-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
          <Coins className="h-8 w-8 text-amber-500/40" />
        </div>
        <h3 className="text-base font-bold text-white">No Invoices Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Create a charge from the POS tab. Payments from any chain will appear here settled in USDT on Polygon.
        </p>
      </div>
    );
  }

  const getStatusPill = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Settled
          </span>
        );
      case 'PROCESSING':
      case 'KNOWN_DEPOSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Swapping
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-sm mx-auto w-full px-2 space-y-3 pb-8">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">
          Payment Activity ({invoices.length})
        </h2>
        <span className="text-[11px] text-emerald-400 font-mono font-semibold">
          USDT on Polygon
        </span>
      </div>

      <div className="space-y-2">
        {invoices.map((inv) => (
          <button
            key={inv.id}
            type="button"
            onClick={() => {
              if (inv.status === 'SUCCESS' || inv.status === 'COMPLETED') {
                onOpenReceipt(inv);
              } else {
                onSelectInvoice(inv);
              }
            }}
            className="w-full bg-slate-900/80 hover:bg-slate-900 active:scale-[0.98] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center font-bold text-base">
                {inv.fiatCurrency === 'CRC' ? '🇨🇷' : (inv.fiatCurrency === 'SVC' ? '🇸🇻' : (inv.fiatCurrency === 'GMD' ? '🇬🇲' : '🇪🇺'))}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white font-mono">
                    {formatFiat(inv.fiatAmount, inv.fiatCurrency)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {inv.description || 'Invoice'} • {formatRelativeTime(inv.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-mono font-black text-emerald-400">
                  +{inv.usdAmount?.toFixed(2)} USDT
                </div>
                <div className="mt-0.5">{getStatusPill(inv.status)}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

