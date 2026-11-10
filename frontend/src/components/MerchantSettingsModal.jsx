import React, { useState } from 'react';
import { X, Shield, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

export function MerchantSettingsModal({ isOpen, onClose, config, onSave, onConnectWallet }) {
  const [polygonAddress, setPolygonAddress] = useState(config.polygonAddress || '');
  const [name, setName] = useState(config.name || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(polygonAddress)) {
      setError('Please enter a valid 42-character Polygon EVM address starting with 0x');
      return;
    }
    setError('');
    onSave({
      polygonAddress,
      name
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="h-4 w-4" />
            </div>
            <h2 id="settings-modal-title" className="text-base font-bold text-white">DashPay & Aurora Intents Settings</h2>
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

          {/* Polygon Wallet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="polygon-addr-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Polygon (Matic) Payout Address <span className="text-amber-400">*</span>
              </label>
              {typeof window !== 'undefined' && window.ethereum && (
                <button
                  type="button"
                  onClick={async () => {
                    if (onConnectWallet) {
                      const addr = await onConnectWallet();
                      if (addr) setPolygonAddress(addr);
                    }
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Auto-fill from wallet
                </button>
              )}
            </div>
            <input
              id="polygon-addr-input"
              type="text"
              value={polygonAddress}
              onChange={(e) => setPolygonAddress(e.target.value.trim())}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="0x..."
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              When running inside the Nimiq Pay host app, this address is automatically populated from your wallet.
            </p>
          </div>

          {/* Settlement Token: Fixed to USDT on Polygon */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Settlement Token</span>
              <span className="font-bold text-white font-mono text-sm text-emerald-400">USDT (Polygon PoS)</span>
              <span className="font-mono text-[10px] text-slate-500 block">0xc2132D05D31c914a87C6611C10748AEb04B58e8F</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              DashPay Native
            </span>
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
