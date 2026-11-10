import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatFiat, truncateAddress } from '../services/formatters';

const PRESETS = {
  CRC: [5000, 15000, 25000, 50000],
  SVC: [87.5, 175, 350, 875],
  GMD: [500, 1000, 2500, 5000],
  EUR: [20, 50, 100, 250]
};

export function CreateInvoiceModal({
  isOpen,
  onClose,
  fxRates,
  merchantAddress,
  onCreateInvoice,
  onConnectWallet
}) {
  if (!isOpen) return null;

  const [fiatCurrency, setFiatCurrency] = useState('CRC');
  const [fiatAmount, setFiatAmount] = useState('15000');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rate = fxRates?.rates?.[fiatCurrency] || 1;
  const numAmount = parseFloat(fiatAmount) || 0;
  const estimatedUsdt = rate > 0 ? (numAmount / rate) : 0;

  const handleCurrencyChange = (newCur) => {
    setFiatCurrency(newCur);
    const defaults = PRESETS[newCur] || [100];
    setFiatAmount(defaults[1]?.toString() || defaults[0]?.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!merchantAddress) {
      setError('Please connect your Nimiq Pay wallet or set a Polygon payout address first.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid price amount greater than zero.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onCreateInvoice({
        fiatCurrency,
        fiatAmount: numAmount,
        description: description.trim() || `${fiatCurrency} Order Checkout`,
        customerEmail: customerEmail.trim(),
        merchantPolygonAddress: merchantAddress
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-labelledby="create-invoice-title"
        aria-modal="true"
      >
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Nimiq Pay Merchant POS</span>
            <h2 id="create-invoice-title" className="text-lg font-bold text-white">
              Create New Invoice
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Wallet check banner */}
          {!merchantAddress && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex items-center justify-between">
              <span className="text-amber-300">Nimiq Pay wallet not connected yet.</span>
              <button
                type="button"
                onClick={onConnectWallet}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* 1. Currency Selector */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Choose Currency <span className="text-amber-400">*</span>
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* CRC */}
              <label 
                className={`flex flex-col p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'CRC'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-sm ring-1 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="fiatCurrency"
                  value="CRC"
                  checked={fiatCurrency === 'CRC'}
                  onChange={() => handleCurrencyChange('CRC')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span>🇨🇷</span>
                  <span className="font-bold text-[11px] font-mono text-amber-300">CRC</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Colones</span>
                <span className="text-[10px] text-slate-400 truncate">Costa Rica</span>
              </label>

              {/* SVC */}
              <label 
                className={`flex flex-col p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'SVC'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-sm ring-1 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="fiatCurrency"
                  value="SVC"
                  checked={fiatCurrency === 'SVC'}
                  onChange={() => handleCurrencyChange('SVC')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span>🇸🇻</span>
                  <span className="font-bold text-[11px] font-mono text-amber-300">SVC</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Colones</span>
                <span className="text-[10px] text-slate-400 truncate">El Salvador</span>
              </label>

              {/* GMD */}
              <label 
                className={`flex flex-col p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'GMD'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-sm ring-1 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="fiatCurrency"
                  value="GMD"
                  checked={fiatCurrency === 'GMD'}
                  onChange={() => handleCurrencyChange('GMD')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span>🇬🇲</span>
                  <span className="font-bold text-[11px] font-mono text-amber-300">GMD</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Dalasi</span>
                <span className="text-[10px] text-slate-400 truncate">The Gambia</span>
              </label>

              {/* EUR */}
              <label 
                className={`flex flex-col p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'EUR'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-sm ring-1 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="fiatCurrency"
                  value="EUR"
                  checked={fiatCurrency === 'EUR'}
                  onChange={() => handleCurrencyChange('EUR')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span>🇪🇺</span>
                  <span className="font-bold text-[11px] font-mono text-amber-300">EUR</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Euros</span>
                <span className="text-[10px] text-slate-400 truncate">Eurozone</span>
              </label>

            </div>
          </fieldset>

          {/* 2. Price Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="fiat-amount-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Price in {fiatCurrency} <span className="text-amber-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                1 USD ≈ {rate.toFixed(2)} {fiatCurrency}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-mono">
                {fiatCurrency === 'EUR' ? '€' : (fiatCurrency === 'GMD' ? 'D' : '₡')}
              </span>
              <input
                id="fiat-amount-input"
                type="number"
                step="any"
                min="0.01"
                required
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-lg font-bold font-mono text-white focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="0.00"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">Quick:</span>
              <div className="flex flex-wrap gap-1">
                {(PRESETS[fiatCurrency] || []).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFiatAmount(preset.toString())}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-colors ${
                      parseFloat(fiatAmount) === preset
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {fiatCurrency === 'CRC' ? Math.round(preset).toLocaleString() : preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Real-Time Settlement Preview (USDT on Polygon) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/20">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Settles on Nimiq Pay (Polygon)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {estimatedUsdt.toFixed(2)} USDT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (Matic / Polygon 137)
              </span>
            </div>
            {merchantAddress && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Payout wallet: {truncateAddress(merchantAddress, 8, 6)}
              </p>
            )}
          </div>

          {/* 4. Description */}
          <div>
            <label htmlFor="order-desc-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Order Description
            </label>
            <input
              id="order-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fresh Goods / Services"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !merchantAddress}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Invoice</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
