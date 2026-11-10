import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wallet, RefreshCw, Plus, Tag } from 'lucide-react';
import { MobileKeypad } from './MobileKeypad';
import { formatFiat, truncateAddress } from '../services/formatters';

const CURRENCIES = [
  { code: 'CRC', symbol: '₡', flag: '🇨🇷', label: 'Colones' },
  { code: 'SVC', symbol: '₡', flag: '🇸🇻', label: 'Colones' },
  { code: 'GMD', symbol: 'D', flag: '🇬🇲', label: 'Dalasi' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'Euros' }
];

const QUICK_INCREMENTS = {
  CRC: [1000, 5000, 10000, 20000],
  SVC: [10, 25, 50, 100],
  GMD: [100, 250, 500, 1000],
  EUR: [5, 10, 20, 50]
};

export function PosChargeScreen({
  merchantAddress,
  polygonUsdtBalance,
  fxRates,
  onCharge,
  onConnectWallet,
  isConnectingWallet
}) {
  const [fiatCurrency, setFiatCurrency] = useState('CRC');
  const [amountStr, setAmountStr] = useState('15000');
  const [description, setDescription] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Rate calculation
  const rate = fxRates?.rates?.[fiatCurrency] || 1;
  const numAmount = parseFloat(amountStr) || 0;
  const estimatedUsdt = rate > 0 ? (numAmount / rate) : 0;

  const currentCur = CURRENCIES.find(c => c.code === fiatCurrency) || CURRENCIES[0];

  const handleKeyPress = (key) => {
    if (key === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr(amountStr ? `${amountStr}.` : '0.');
      return;
    }

    if (amountStr === '0') {
      setAmountStr(key);
    } else if (amountStr.length < 9) {
      setAmountStr(`${amountStr}${key}`);
    }
  };

  const handleDelete = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handleIncrement = (inc) => {
    const curVal = parseFloat(amountStr) || 0;
    setAmountStr((curVal + inc).toString());
  };

  const handleCurrencySwitch = (cur) => {
    setFiatCurrency(cur.code);
    if (cur.code === 'EUR') setAmountStr('25');
    else if (cur.code === 'GMD') setAmountStr('750');
    else if (cur.code === 'SVC') setAmountStr('50');
    else setAmountStr('15000');
  };

  const handleSubmit = async () => {
    if (!merchantAddress) {
      if (onConnectWallet) await onConnectWallet();
      return;
    }
    if (numAmount <= 0) return;

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await onCharge({
        fiatCurrency,
        fiatAmount: numAmount,
        description: description.trim() || `${currentCur.label} Payment`,
        merchantPolygonAddress: merchantAddress
      });
    } catch (err) {
      setSubmitError(err.message || 'Could not create the invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between max-w-sm mx-auto w-full px-2 py-1 space-y-4">
      
      {/* 1. Currency Segmented Control (Pills) */}
      <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
        {CURRENCIES.map((cur) => (
          <button
            key={cur.code}
            type="button"
            onClick={() => handleCurrencySwitch(cur)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              fiatCurrency === cur.code
                ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-100'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{cur.flag}</span>
            <span>{cur.code}</span>
          </button>
        ))}
      </div>

      {/* 2. Amount Hero Display */}
      <div className="text-center py-2 space-y-1">
        <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
          Price in {currentCur.label} ({fiatCurrency})
        </div>

        {/* Large Amount */}
        <div className="flex items-baseline justify-center gap-1.5 font-mono">
          <span className="text-3xl text-amber-400 font-black select-none">
            {currentCur.symbol}
          </span>
          <span className="text-5xl font-black text-white tracking-tight select-none">
            {fiatCurrency === 'CRC' 
              ? Math.round(numAmount).toLocaleString('en-US') 
              : numAmount.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '0'}
          </span>
        </div>

        {/* Converted Polygon USDT Subtitle */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>≈ {estimatedUsdt.toFixed(2)} USDT on Polygon</span>
        </div>

        {/* Optional Note toggle */}
        <div className="pt-1">
          {showNoteInput ? (
            <input
              type="text"
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => { if (!description) setShowNoteInput(false); }}
              placeholder="Order note (e.g. Table 2, Espresso)"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-center text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-full max-w-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto"
            >
              <Tag className="h-3 w-3" />
              <span>{description ? `Note: ${description}` : '+ Add note'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Quick Increment Chips */}
      <div className="flex items-center justify-center gap-1.5">
        {(QUICK_INCREMENTS[fiatCurrency] || []).map((inc) => (
          <button
            key={inc}
            type="button"
            onClick={() => handleIncrement(inc)}
            className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-800/80 text-xs font-mono font-semibold transition-all"
          >
            +{inc >= 1000 ? `${inc / 1000}k` : inc}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAmountStr('0')}
          className="px-2 py-1 rounded-xl bg-slate-900/40 text-slate-500 hover:text-slate-300 text-xs font-medium"
        >
          Clear
        </button>
      </div>

      {/* 4. Native Mobile Keypad */}
      <div className="pt-1 pb-1">
        <MobileKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onClear={() => setAmountStr('0')}
        />
      </div>

      {/* 5. Main Primary Action Button */}
      <div className="pt-2">
        {submitError && (
          <div className="mb-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            {submitError}
          </div>
        )}
        {!merchantAddress ? (
          <button
            type="button"
            onClick={onConnectWallet}
            disabled={isConnectingWallet}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {isConnectingWallet ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Connecting wallet...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet to Charge</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={numAmount <= 0 || isSubmitting}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 active:scale-[0.98] text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 select-none"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Creating Invoice...</span>
              </>
            ) : (
              <>
                <span>Charge {formatFiat(numAmount, fiatCurrency)}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}

