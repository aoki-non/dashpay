import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles, RefreshCw, AlertCircle, ArrowRight, Wallet, CheckCircle2, ChevronRight } from 'lucide-react';
import { TokenChainSelector } from './TokenChainSelector';
import { PaymentDetails } from './PaymentDetails';
import { StatusTracker } from './StatusTracker';
import { formatFiat, formatCryptoAmount, truncateAddress } from '../services/formatters';
import { requestQuoteForInvoice } from '../services/api';

// Demo refund addresses for common chains
const DEFAULT_REFUND_ADDRESSES = {
  sol: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  btc: 'bc1qwufdg7409xuypl36scltayhdulaqyafvuxkmqf',
  eth: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  pol: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
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
  invoices,
  tokens,
  chains,
  merchantConfig,
  onBackToDashboard,
  onSelectAnotherInvoice,
  onOpenReceipt
}) {
  // If no invoice is chosen, prompt user to select one
  if (!invoice) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Select an Invoice to Pay</h2>
        <p className="text-xs text-slate-400">Choose one of the merchant invoices below to test the checkout experience:</p>
        <div className="space-y-2 mt-4 text-left">
          {invoices.map(inv => (
            <button
              key={inv.id}
              type="button"
              onClick={() => onSelectAnotherInvoice(inv)}
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-mono">{inv.id}</span>
                  <span className="text-xs text-slate-400">({inv.merchantName})</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {inv.description} • {formatFiat(inv.fiatAmount, inv.fiatCurrency)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {inv.usdAmount?.toFixed(2)} {inv.stablecoin}
                </span>
                <span className="text-[10px] text-slate-500 block">on Polygon</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Selected Token for payment (defaults to Solana SOL or BTC or ETH)
  const [selectedToken, setSelectedToken] = useState(() => {
    return tokens.find(t => t.blockchain === 'sol' && t.symbol === 'SOL') ||
           tokens.find(t => t.blockchain === 'btc' && t.symbol === 'BTC') ||
           tokens[0];
  });

  // Refund address on origin chain
  const [refundTo, setRefundTo] = useState(() => {
    return DEFAULT_REFUND_ADDRESSES[selectedToken?.blockchain] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  });

  // Active Quote
  const [activeQuote, setActiveQuote] = useState(invoice.activeQuote || null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  // Update default refund address when token/chain changes
  useEffect(() => {
    if (selectedToken) {
      const defaultAddr = DEFAULT_REFUND_ADDRESSES[selectedToken.blockchain] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      setRefundTo(defaultAddr);
    }
  }, [selectedToken]);

  // Handle request quote
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

  const isCompleted = invoice.status === 'COMPLETED' || activeQuote?.status === 'SUCCESS';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Merchant Portal</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Invoice Ref: {invoice.id}
        </span>
      </div>

      {/* Invoice Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {invoice.merchantName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Settles on Polygon PoS
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{formatFiat(invoice.fiatAmount, invoice.fiatCurrency)}</span>
              <span className="text-sm font-normal text-slate-400 font-mono">
                ({invoice.fiatCurrency})
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {invoice.description || 'Order Checkout'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left sm:text-right shrink-0">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Merchant Receives</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {invoice.usdAmount?.toFixed(2)} {invoice.stablecoin}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              To {truncateAddress(invoice.merchantPolygonAddress, 6, 4)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Steps */}
      <div className="space-y-6">
        
        {/* Step 1: Select Token & Chain */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Step 1: Choose Your Crypto</span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Pay with any token on any supported chain
              </h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 font-medium">
              {tokens.length}+ tokens available
            </span>
          </div>

          {/* Token Chain Selector */}
          <TokenChainSelector
            tokens={tokens}
            chains={chains}
            selectedToken={selectedToken}
            onSelectToken={(t) => {
              setSelectedToken(t);
              setActiveQuote(null); // Reset quote on token change
            }}
            targetUsd={invoice.usdAmount}
          />

          {/* Payer Refund Address Input */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <label htmlFor="payer-refund-input" className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Your {selectedToken?.chainName} Refund Address <span className="text-indigo-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setRefundTo(DEFAULT_REFUND_ADDRESSES[selectedToken?.blockchain] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F')}
                className="text-indigo-400 hover:text-indigo-300 text-[11px]"
              >
                Use Sample Address
              </button>
            </div>
            <input
              id="payer-refund-input"
              type="text"
              value={refundTo}
              onChange={(e) => setRefundTo(e.target.value.trim())}
              placeholder={`Your ${selectedToken?.chainName || 'wallet'} address...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>Aurora Intents guarantee: if quote expires or deposit is incomplete, funds are automatically refunded here.</span>
            </p>
          </div>

          {quoteError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{quoteError}</span>
            </div>
          )}

          {/* Action button to generate deposit address */}
          {!activeQuote && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRequestQuote}
                disabled={loadingQuote}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loadingQuote ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Requesting Aurora Intents Quote & Deposit Address...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Get Payment Deposit Address</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Payment Details (QR & Deposit Address) */}
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

    </div>
  );
}
