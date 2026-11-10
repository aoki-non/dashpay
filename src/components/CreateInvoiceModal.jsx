import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatFiat } from '../services/formatters';

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
  merchantConfig,
  onCreateInvoice
}) {
  if (!isOpen) return null;

  const [fiatCurrency, setFiatCurrency] = useState('CRC');
  const [fiatAmount, setFiatAmount] = useState('15000');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [stablecoin, setStablecoin] = useState(merchantConfig.defaultStablecoin || 'USDC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate live conversion
  const rate = fxRates?.rates?.[fiatCurrency] || 1;
  const numAmount = parseFloat(fiatAmount) || 0;
  const estimatedUsd = rate > 0 ? (numAmount / rate) : 0;

  // Handle currency change with sensible preset
  const handleCurrencyChange = (newCur) => {
    setFiatCurrency(newCur);
    const defaults = PRESETS[newCur] || [100];
    setFiatAmount(defaults[1]?.toString() || defaults[0]?.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid price greater than zero.');
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
        stablecoin,
        merchantName: merchantConfig.name,
        merchantPolygonAddress: merchantConfig.polygonAddress
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-labelledby="create-invoice-title"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Merchant Point of Sale</span>
            <h2 id="create-invoice-title" className="text-xl font-bold text-white flex items-center gap-2">
              Create New Cross-Chain Invoice
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* 1. Currency Selection (Radio buttons/pills per Selection Matrix) */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Pricing Currency <span className="text-indigo-400">*</span>
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Costa Rican Colón */}
              <label 
                className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'CRC'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50'
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
                  <span className="text-base">🇨🇷</span>
                  <span className="font-bold text-xs font-mono text-indigo-300">CRC</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Colones</span>
                <span className="text-[10px] text-slate-400 truncate">Costa Rica</span>
              </label>

              {/* Salvadoran Colón */}
              <label 
                className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'SVC'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50'
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
                  <span className="text-base">🇸🇻</span>
                  <span className="font-bold text-xs font-mono text-indigo-300">SVC</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Colones</span>
                <span className="text-[10px] text-slate-400 truncate">El Salvador</span>
              </label>

              {/* Gambian Dalasi */}
              <label 
                className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'GMD'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50'
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
                  <span className="text-base">🇬🇲</span>
                  <span className="font-bold text-xs font-mono text-indigo-300">GMD</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Dalasi</span>
                <span className="text-[10px] text-slate-400 truncate">The Gambia</span>
              </label>

              {/* Euro */}
              <label 
                className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                  fiatCurrency === 'EUR'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50'
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
                  <span className="text-base">🇪🇺</span>
                  <span className="font-bold text-xs font-mono text-indigo-300">EUR</span>
                </div>
                <span className="text-xs font-semibold text-slate-200">Euros</span>
                <span className="text-[10px] text-slate-400 truncate">Eurozone</span>
              </label>

            </div>
          </fieldset>

          {/* 2. Amount Input & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="fiat-amount-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Price Amount ({fiatCurrency}) <span className="text-indigo-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Rate: 1 USD ≈ {rate.toFixed(2)} {fiatCurrency}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xl font-bold font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[11px] text-slate-500 font-medium">Quick amounts:</span>
              <div className="flex flex-wrap gap-1.5">
                {(PRESETS[fiatCurrency] || []).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFiatAmount(preset.toString())}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      parseFloat(fiatAmount) === preset
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {fiatCurrency === 'CRC' ? Math.round(preset).toLocaleString() : preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Live Conversion Breakdown (Bridge from Fiat to Polygon Stablecoins) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-medium mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Live Settlement Conversion
              </span>
              <span className="text-[11px] text-slate-400">Target on Polygon</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {estimatedUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-semibold text-indigo-400 ml-1.5">{stablecoin}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Merchant will receive exactly this amount in {stablecoin} on Polygon PoS.
                </p>
              </div>

              {/* Stablecoin selector */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStablecoin('USDC')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                    stablecoin === 'USDC' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  USDC
                </button>
                <button
                  type="button"
                  onClick={() => setStablecoin('USDT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                    stablecoin === 'USDT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  USDT
                </button>
              </div>
            </div>
          </div>

          {/* 4. Description & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="order-desc-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Order / Item Reference
              </label>
              <input
                id="order-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 2x Specialty Coffee"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="customer-email-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Customer Email <span className="text-slate-500 lowercase font-normal">(optional)</span>
              </label>
              <input
                id="customer-email-input"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="buyer@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Invoice...</span>
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
