import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Clock, AlertTriangle, ShieldCheck, ExternalLink, Zap, ArrowDown } from 'lucide-react';
import { formatCryptoAmount, truncateAddress } from '../services/formatters';

export function PaymentDetails({
  quote,
  selectedToken,
  invoice,
  onExpire
}) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(15 * 60);

  const quoteData = quote?.quote || {};
  const depositAddress = quoteData.depositAddress || '';
  const depositMemo = quoteData.depositMemo || null;
  const amountInFormatted = quoteData.amountInFormatted || '0';
  const timeEstimate = quoteData.timeEstimate || 25;

  // Countdown timer for quote deadline
  useEffect(() => {
    const deadlineStr = quoteData.deadline;
    if (!deadlineStr) return;

    const interval = setInterval(() => {
      const diff = Math.floor((new Date(deadlineStr).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeftSec(0);
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        setTimeLeftSec(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quoteData.deadline, onExpire]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Construct QR value depending on chain
  let qrValue = depositAddress;
  if (selectedToken.blockchain === 'btc') {
    qrValue = `bitcoin:${depositAddress}?amount=${amountInFormatted}`;
  } else if (selectedToken.blockchain === 'sol') {
    qrValue = `solana:${depositAddress}?amount=${amountInFormatted}`;
  } else if (['eth', 'pol', 'base', 'arb', 'bsc', 'avax', 'op'].includes(selectedToken.blockchain)) {
    qrValue = `ethereum:${depositAddress}`;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header with countdown timer */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Step 2: Transfer Funds</span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Send Exact Amount to Deposit Address
          </h3>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
          timeLeftSec < 120 
            ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
        }`}>
          <Clock className="h-3.5 w-3.5" />
          <span>{formatCountdown(timeLeftSec)}</span>
        </div>
      </div>

      {/* QR Code and Amount Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
        
        {/* QR Code */}
        <div className="bg-white p-3 rounded-2xl shadow-md shrink-0 flex items-center justify-center">
          <QRCodeSVG
            value={qrValue || '0x'}
            size={140}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Amount & Token Details */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <span className="text-xs text-slate-400 font-medium">Exact amount to send:</span>
          <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {amountInFormatted}
            </span>
            <span className="text-sm font-bold text-indigo-400 font-mono">
              {selectedToken.symbol}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            ≈ ${(quoteData.amountInUsd ? Number(quoteData.amountInUsd).toFixed(2) : '—')} USD on {selectedToken.chainName}
          </p>

          <button
            type="button"
            onClick={() => copyToClipboard(amountInFormatted, setCopiedAmount)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedAmount ? 'Copied Amount!' : 'Copy Exact Amount'}</span>
          </button>
        </div>

      </div>

      {/* Deposit Address Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            {selectedToken.chainName} One-Time Deposit Address:
          </label>
          <span className="text-slate-500 font-mono text-[11px]">Chain: {selectedToken.blockchain}</span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="font-mono text-xs text-slate-200 break-all select-all flex-1">
            {depositAddress}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(depositAddress, setCopiedAddress)}
            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 shrink-0 transition-colors"
            title="Copy Deposit Address"
          >
            {copiedAddress ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Deposit Memo (if applicable) */}
      {depositMemo && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>Deposit Memo Required for this Chain</span>
          </div>
          <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-amber-500/20">
            <span className="font-mono text-xs text-white">{depositMemo}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(depositMemo, setCopiedMemo)}
              className="text-xs text-amber-300 hover:text-white flex items-center gap-1"
            >
              {copiedMemo ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Memo</span>
            </button>
          </div>
        </div>
      )}

      {/* Aurora Intents Guarantee Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Settlement Time</span>
          <span className="font-bold text-white flex items-center gap-1 mt-0.5 font-mono">
            <Zap className="h-3 w-3 text-amber-400" />
            ~{timeEstimate}s Speed
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Merchant Receives</span>
          <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
            {invoice.usdAmount?.toFixed(2)} {invoice.stablecoin} (Polygon)
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Slippage & Refund</span>
          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            100% Guaranteed
          </span>
        </div>
      </div>

    </div>
  );
}
