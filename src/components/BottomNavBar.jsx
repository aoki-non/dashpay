import React from 'react';
import { Zap, Clock, Settings, Layers } from 'lucide-react';

export function BottomNavBar({ activeTab, onChangeTab, invoiceCount }) {
  const tabs = [
    { id: 'charge', label: 'POS Charge', icon: Zap },
    { id: 'activity', label: 'Activity', icon: Clock, badge: invoiceCount > 0 ? invoiceCount : null },
    { id: 'settings', label: 'Wallet', icon: Settings }
  ];

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 max-w-sm mx-auto bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative select-none ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
