import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, RefreshCw, ExternalLink, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchSwapStatus } from '../services/api';
import { truncateAddress } from '../services/formatters';

const STEPS = [
  { id: 'PENDING_DEPOSIT', label: '1. Awaiting Deposit', desc: 'Transfer token to deposit address' },
  { id: 'KNOWN_DEPOSIT_TX', label: '2. Deposit Detected', desc: 'Transaction confirmed on source chain' },
  { id: 'PROCESSING', label: '3. Aurora Swapping', desc: 'Solver executing cross-chain settlement' },
  { id: 'SUCCESS', label: '4. Settled in Nimiq Pay', desc: 'USDT delivered to merchant on Polygon' }
];

export function StatusTracker({
  depositAddress,
  depositMemo,
  invoice,
  onCompleted,
  apiKey = ''
}) {
  const [currentStatus, setCurrentStatus] = useState(invoice.paymentDetails?.status || 'PENDING_DEPOSIT');
  const [swapDetails, setSwapDetails] = useState(invoice.paymentDetails?.swapDetails || null);

  // Poll status every 4 seconds
  useEffect(() => {
    if (!depositAddress || currentStatus === 'SUCCESS' || currentStatus === 'FAILED' || currentStatus === 'REFUNDED') {
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetchSwapStatus({
          depositAddress,
          depositMemo,
          invoiceId: invoice.id,
          apiKey
        });

        if (res.success && res.data) {
          const newStatus = res.data.status;
          setCurrentStatus(newStatus);
          if (res.data.swapDetails) {
            setSwapDetails(res.data.swapDetails);
          }

          if (newStatus === 'SUCCESS') {
            if (onCompleted) onCompleted(res.invoice || invoice);
          }
        }
      } catch (err) {
        console.warn('Status poll error:', err.message);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [depositAddress, depositMemo, invoice.id, currentStatus, apiKey, onCompleted]);

  let activeIndex = 0;
  if (currentStatus === 'KNOWN_DEPOSIT_TX' || currentStatus === 'KNOWN_DEPOSIT') activeIndex = 1;
  else if (currentStatus === 'PROCESSING') activeIndex = 2;
  else if (currentStatus === 'SUCCESS' || currentStatus === 'COMPLETED') activeIndex = 3;

  const polygonTx = swapDetails?.destinationChainTxHashes?.[0] || invoice.paymentDetails?.destinationTx;
  const originTx = swapDetails?.originChainTxHashes?.[0] || invoice.paymentDetails?.originTx;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Title & Live Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Step 3: Settlement Tracker</span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Aurora Intents Real-Time Execution
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {currentStatus === 'SUCCESS' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
              Settled on Polygon
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Monitoring Blockchain
            </span>
          )}
        </div>
      </div>

      {/* 4-Step Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {STEPS.map((step, idx) => {
          const isDone = activeIndex > idx || currentStatus === 'SUCCESS';
          const isCurrent = activeIndex === idx && currentStatus !== 'SUCCESS';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                  : isCurrent
                  ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/40 animate-pulse-subtle'
                  : 'border-slate-800 bg-slate-950/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${isDone ? 'text-emerald-400' : (isCurrent ? 'text-amber-400' : 'text-slate-500')}`}>
                  {step.label}
                </span>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Settlement Success Details */}
      {currentStatus === 'SUCCESS' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <Sparkles className="h-4 w-4" />
            <span>USDT Successfully Delivered to Nimiq Pay on Polygon!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Merchant Received</span>
              <span className="font-mono font-bold text-white">
                {invoice.usdAmount?.toFixed(2)} USDT (Polygon/Matic)
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Nimiq Pay Polygon Address</span>
              <span className="font-mono text-slate-300">
                {truncateAddress(invoice.merchantPolygonAddress, 6, 6)}
              </span>
            </div>
          </div>

          {polygonTx && (
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Polygonscan Transaction:</span>
              <a
                href={`https://polygonscan.com/tx/${polygonTx}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 font-semibold"
              >
                <span>{truncateAddress(polygonTx, 8, 8)}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
