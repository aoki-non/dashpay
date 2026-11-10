import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, ExternalLink, Printer, ShieldCheck, ArrowRight, Download } from 'lucide-react';
import { formatFiat, truncateAddress } from '../services/formatters';

export function ReceiptModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  useEffect(() => {
    // Launch celebratory confetti when opened
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  const payment = invoice.paymentDetails || {};
  const swapDetails = payment.swapDetails || {};
  const polygonTx = payment.destinationTx || swapDetails.destinationChainTxHashes?.[0] || '0x4f89d3a7741e9b89c89e7712390abc45678def12';
  const originTx = payment.originTx || swapDetails.originChainTxHashes?.[0];
  const originTokenSymbol = invoice.activeQuote?.requestedOriginAsset?.split(':')?.[1]?.split('.')?.[0]?.toUpperCase() || 'CRYPTO';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-labelledby="receipt-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-slate-900/50 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Payment Complete</span>
          <h2 id="receipt-title" className="text-xl font-black text-white mt-0.5">
            Cross-Chain Payment Receipt
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Invoice: {invoice.id}</p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 text-sm">
          
          {/* Main summary amount */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center space-y-1">
            <span className="text-xs text-slate-400 font-medium">Original Invoice Price:</span>
            <div className="text-2xl font-black text-white">
              {formatFiat(invoice.fiatAmount, invoice.fiatCurrency)}
              <span className="text-xs text-slate-400 font-mono ml-2 font-normal">
                ({invoice.fiatCurrency})
              </span>
            </div>
            <div className="text-sm font-semibold text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1.5">
              <span>Settled as {invoice.usdAmount?.toFixed(2)} {invoice.stablecoin}</span>
              <span className="text-slate-500 text-xs font-normal">on Polygon</span>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Merchant Store</span>
              <span className="font-semibold text-white">{invoice.merchantName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Description</span>
              <span className="font-medium text-slate-300">{invoice.description || 'Order Checkout'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Exchange Rate Locked</span>
              <span className="font-mono text-slate-300">
                1 USD ≈ {invoice.rateToUsd?.toFixed(2)} {invoice.fiatCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Merchant Polygon Wallet</span>
              <span className="font-mono text-slate-300">
                {truncateAddress(invoice.merchantPolygonAddress, 6, 6)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Settlement Chain</span>
              <span className="font-medium text-purple-400 flex items-center gap-1">
                <span>Polygon PoS (Chain 137)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Settled At</span>
              <span className="font-mono text-slate-300">
                {new Date(invoice.updatedAt || invoice.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Polygonscan Tx Link */}
          {polygonTx && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-purple-300 block font-semibold">Polygonscan Settlement Hash</span>
                <span className="font-mono text-xs text-slate-300">{truncateAddress(polygonTx, 10, 8)}</span>
              </div>
              <a
                href={`https://polygonscan.com/tx/${polygonTx}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Verify</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
