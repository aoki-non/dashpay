import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles, RefreshCw, AlertCircle, ArrowRight, Wallet, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { TokenChainSelector } from './TokenChainSelector';
import { PaymentDetails } from './PaymentDetails';
import { StatusTracker } from './StatusTracker';
import { formatFiat, formatCryptoAmount, truncateAddress } from '../services/formatters';
import { requestQuoteForInvoice } from '../services/api';

const DEFAULT_REFUND_ADDRESSES = {
  sol: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  btc: 'bc1qwufdg7409xuypl36scltayhdulaqyafvuxkmqf',
  eth: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  pol: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
  base: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  arb: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  bsc: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  near: 'payer.near',
  tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  sui: '0x1234567890abcdef1234567890abcdef12345678',
  doge: 'D8vFz4p1yPQaBicpGXj2Gz2PthGDaXukNzh'
};

export function CustomerCheckout({
  invoice,
  tokens,
  chains,
  merchantConfig,
  onBackToDashboard,
  onOpenReceipt
}) {
  if (!invoice) return null;

  const [selectedToken, setSelectedToken] = useState(() => {
    return tokens.find(t => t.blockchain === 'sol' && t.symbol === 'SOL') ||
           tokens.find(t => t.blockchain === 'btc' && t.symbol === 'BTC') ||
           tokens[0];
  });

  const [refundTo, setRefundTo] = useState(() => {
    return DEFAULT_REFUND_ADDRESSES[selectedToken?.blockchain] || '0x71c7656ec7ab88b098defb751b7401b5f6d8976f';
  });

  const [activeQuote, setActiveQuote] = useState(invoice.activeQuote || null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (selectedToken) {
      setRefundTo(DEFAULT_REFUND_ADDRESSES[selectedToken.blockchain] || '0x71c7656ec7ab88b098defb751b7401b5f6d8976f');
    }
  }, [selectedToken]);

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
        apiKey: merchantConfig.auroraApiKey || '',
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

  const handleCopyLink = () => {
    const url = `${window.location.origin}?invoice=${invoice.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
            {tokens.length}+ tokens
          </span>
        </div>

        {/* Token Selector */}
        <TokenChainSelector
          tokens={tokens}
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
            Your {selectedToken?.chainName} Refund Address:
          </label>
          <input
            id="refund-input"
            type="text"
            value={refundTo}
            onChange={(e) => setRefundTo(e.target.value.trim())}
            placeholder={`Your ${selectedToken?.chainName || 'origin'} address...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
          />
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
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
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
          apiKey={merchantConfig.auroraApiKey}
          onCompleted={(updatedInv) => {
            if (onOpenReceipt) onOpenReceipt(updatedInv);
          }}
        />
      )}

    </div>
  );
}
