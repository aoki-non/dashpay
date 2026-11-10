import React from 'react';
import { Delete } from 'lucide-react';

export function MobileKeypad({ onKeyPress, onClear, onDelete }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {keys.map((k) => {
        if (k === 'del') {
          return (
            <button
              key={k}
              type="button"
              onClick={onDelete}
              className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all select-none border border-slate-800/60"
            >
              <Delete className="h-5 w-5" />
            </button>
          );
        }

        return (
          <button
            key={k}
            type="button"
            onClick={() => onKeyPress(k)}
            className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 active:scale-95 text-white font-mono text-xl font-bold flex items-center justify-center transition-all select-none border border-slate-800/60 shadow-sm"
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

