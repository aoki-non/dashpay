import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles, RefreshCw, AlertCircle, ArrowRight, Wallet, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { TokenChainSelector } from './TokenChainSelector';
import { PaymentDetails } from './PaymentDetails';
import { StatusTracker } from './StatusTracker';
import { formatFiat, formatCryptoAmount, truncateAddress, copyTextToClipboard } from '../services/formatters';
import { requestQuoteForInvoice } from '../services/api';

// Placeholder hints only — never pre-filled, so a refund can never
// silently go to an address the payer did not enter.
const REFUND_PLACEHOLDERS = {
  sol: 'Your Solana address...',
  btc: 'Your Bitcoin address (bc1...)...',
  eth: 'Your Ethereum address (0x...)...',
  pol: 'Your Polygon address (0x...)...',
  base: 'Your Base address (0x...)...',
  arb: 'Your Arbitrum address (0x...)...',
  bsc: 'Your BNB Chain address (0x...)...',
  near: 'Your NEAR account (you.near)...',
  tron: 'Your TRON address (T...)...',
  sui: 'Your Sui address (0x...)...',
  doge: 'Your Dogecoin address (D...)...'
};

function pickDefaultToken(tokenList) {
  if (!tokenList || tokenList.length === 0) return null;
  return tokenList.find(t => t.blockchain === 'sol' && t.symbol === 'SOL') ||
         tokenList.find(t => t.blockchain === 'btc' && t.symbol === 'BTC') ||
         tokenList[0];
}

export function CustomerCheckout({
  invoice,
  tokens,
  chains,
  onBackToDashboard,
  onOpenReceipt
}) {
  const [selectedToken, setSelectedToken] = useState(() => pickDefaultToken(tokens));
  const [refundTo, setRefundTo] = useState('');
  const [activeQuote, setActiveQuote] = useState(invoice?.activeQuote || null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Tokens load asynchronously after mount; pick a default once they arrive.
  useEffect(() => {
    if (!selectedToken && tokens && tokens.length > 0) {
      setSelectedToken(pickDefaultToken(tokens));
    }
  }, [tokens, selectedToken]);

  // Reset quote state when a different invoice is opened.
  const invoiceId = invoice?.id;
  useEffect(() => {
    setActiveQuote(invoice?.activeQuote || null);
    setQuoteError('');
  }, [invoiceId]);

  const handleCompleted = useCallback((updatedInv) => {
    if (onOpenReceipt) onOpenReceipt(updatedInv);
  }, [onOpenReceipt]);

  if (!invoice) return null;

  const handleRequestQuote = async () => {
    if (!selectedToken) {
      setQuoteError('Please select a token to pay with.');
      return;
    }
    if (!refundTo.trim()) {
      setQuoteError(`Please enter your refund address on ${selectedToken.chainName || selectedToken.blockchain}.`);
      return;
    }

    try {
      setLoadingQuote(true);
      setQuoteError('');
      const res = await requestQuoteForInvoice({
        invoiceId: invoice.id,
        originAsset: selectedToken.assetId,
        refundTo: refundTo.trim(),
        slippageTolerance: 100, // 1%
        dry: false
      });

      if (res.success && res.quote) {
        setActiveQuote(res.quote);
      }
    } catch (err) {
      console.error('Quote error:', err);
      setQuoteError(err.message || 'Failed to fetch quote from Aurora Intents.');
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}?invoice=${invoice.id}`;
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-sm mx-auto w-full px-2 space-y-4 pb-8">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>New Charge</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
        >
          {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
        </button>
      </div>

      {/* Invoice Amount Hero Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center shadow-lg space-y-1">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
          Invoice Ref #{invoice.id}
        </span>
        <div className="text-3xl font-black text-white font-mono">
          {formatFiat(invoice.fiatAmount, invoice.fiatCurrency)}
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 font-mono">
          <span>Settles as {invoice.usdAmount?.toFixed(2)} USDT</span>
          <span className="text-slate-500 font-normal">(Polygon)</span>
        </div>
        {invoice.description && (
          <p className="text-[11px] text-slate-400 mt-1">
            {invoice.description}
          </p>
        )}
      </div>

      {/* Step 1: Select Crypto Token */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-bold text-slate-200">
            Pay with Any Token
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {(tokens || []).length}+ tokens
          </span>
        </div>

        {/* Token Selector */}
        <TokenChainSelector
          tokens={tokens || []}
          chains={chains}
          selectedToken={selectedToken}
          onSelectToken={(t) => {
            setSelectedToken(t);
            setActiveQuote(null);
          }}
          targetUsd={invoice.usdAmount}
        />

        {/* Refund Address */}
        <div className="pt-2">
          <label htmlFor="refund-input" className="block text-[11px] font-bold text-slate-400 mb-1">
            Your {selectedToken?.chainName || 'wallet'} refund address <span className="text-amber-400">*</span>
          </label>
          <input
            id="refund-input"
            type="text"
            value={refundTo}
            onChange={(e) => setRefundTo(e.target.value)}
            placeholder={REFUND_PLACEHOLDERS[selectedToken?.blockchain] || 'Your refund address on the origin chain...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            If the swap fails or expires, funds are refunded here. Double-check it.
          </p>
        </div>

        {quoteError && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{quoteError}</span>
          </div>
        )}

        {/* Get Payment QR Button */}
        {!activeQuote && (
          <button
            type="button"
            onClick={handleRequestQuote}
            disabled={loadingQuote}
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loadingQuote ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Requesting Aurora Intents Quote...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Get Payment Deposit Address</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Step 2: Payment Details (QR & Address) */}
      {activeQuote && (
        <PaymentDetails
          quote={activeQuote}
          selectedToken={selectedToken}
          invoice={invoice}
          onExpire={() => {
            setActiveQuote(null);
            setQuoteError('Quote has expired. Please request a new quote.');
          }}
        />
      )}

      {/* Step 3: Real-Time Cross-Chain Settlement Status */}
      {activeQuote && activeQuote.quote?.depositAddress && (
        <StatusTracker
          depositAddress={activeQuote.quote.depositAddress}
          depositMemo={activeQuote.quote.depositMemo}
          invoice={invoice}
          onCompleted={handleCompleted}
        />
      )}

    </div>
  );
}
