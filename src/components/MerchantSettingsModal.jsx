import React, { useState } from 'react';
import { X, Shield, Wallet, Key, CheckCircle, ExternalLink } from 'lucide-react';

export function MerchantSettingsModal({ isOpen, onClose, config, onSave }) {
  if (!isOpen) return null;

  const [polygonAddress, setPolygonAddress] = useState(config.polygonAddress || '');
  const [defaultStablecoin, setDefaultStablecoin] = useState(config.defaultStablecoin || 'USDC');
  const [name, setName] = useState(config.name || '');
  const [auroraApiKey, setAuroraApiKey] = useState(config.auroraApiKey || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(polygonAddress)) {
      setError('Please enter a valid 42-character Polygon EVM address starting with 0x');
      return;
    }
    setError('');
    onSave({
      polygonAddress,
      defaultStablecoin,
      name,
      auroraApiKey
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        role="dialog"
        aria-labelledby="settings-modal-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Wallet className="h-4 w-4" />
            </div>
            <h2 id="settings-modal-title" className="text-lg font-bold text-white">Merchant Payout Settings</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="merchant-name-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Merchant Store Name
            </label>
            <input
              id="merchant-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. San José Fine Coffee"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="polygon-addr-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Polygon Receiving Address (EVM) <span className="text-indigo-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPolygonAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                Use Demo Address
              </button>
            </div>
            <input
              id="polygon-addr-input"
              type="text"
              value={polygonAddress}
              onChange={(e) => setPolygonAddress(e.target.value.trim())}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="0x..."
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-400" />
              All incoming payments from any chain are automatically swapped and delivered directly here on Polygon.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Default Polygon Stablecoin
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  defaultStablecoin === 'USDC' 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-indigo-400 font-mono">USDC</span>
                  <span className="text-xs text-slate-400">Native Polygon</span>
                </div>
                <input
                  type="radio"
                  name="stablecoin"
                  value="USDC"
                  checked={defaultStablecoin === 'USDC'}
                  onChange={() => setDefaultStablecoin('USDC')}
                  className="sr-only"
                />
                {defaultStablecoin === 'USDC' && <CheckCircle className="h-4 w-4 text-indigo-400" />}
              </label>

              <label 
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  defaultStablecoin === 'USDT' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-emerald-400 font-mono">USDT</span>
                  <span className="text-xs text-slate-400">Tether USD</span>
                </div>
                <input
                  type="radio"
                  name="stablecoin"
                  value="USDT"
                  checked={defaultStablecoin === 'USDT'}
                  onChange={() => setDefaultStablecoin('USDT')}
                  className="sr-only"
                />
                {defaultStablecoin === 'USDT' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="aurora-key-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Aurora Intents API Key <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <a 
                href="https://portal.intents.aurora.dev" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <input
              id="aurora-key-input"
              type="text"
              value={auroraApiKey}
              onChange={(e) => setAuroraApiKey(e.target.value.trim())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Leave blank to use direct Aurora Intents engine"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              If left blank, the app uses direct 1Click Defuse solver liquidity rails with zero setup needed.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
