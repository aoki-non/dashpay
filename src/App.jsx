import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MerchantDashboard } from './components/MerchantDashboard';
import { CustomerCheckout } from './components/CustomerCheckout';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { MerchantSettingsModal } from './components/MerchantSettingsModal';
import { ReceiptModal } from './components/ReceiptModal';
import { fetchFxRates, fetchInvoices, fetchSupportedTokens, createInvoice as apiCreateInvoice } from './services/api';
import { CONFIG } from '../server/config.js';

export function App() {
  const [currentView, setCurrentView] = useState('merchant'); // 'merchant' | 'checkout'
  const [fxRates, setFxRates] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [tokensData, setTokensData] = useState({ tokens: [], chains: [] });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // Merchant config
  const [merchantConfig, setMerchantConfig] = useState({
    name: 'San José Gourmet & Crafts',
    polygonAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    defaultStablecoin: 'USDC',
    auroraApiKey: ''
  });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Initial data loading
  useEffect(() => {
    async function loadData() {
      try {
        const [fxRes, invRes, tokRes] = await Promise.all([
          fetchFxRates(),
          fetchInvoices(),
          fetchSupportedTokens(merchantConfig.auroraApiKey)
        ]);

        if (fxRes.rates) setFxRates(fxRes);
        if (invRes.invoices) {
          setInvoices(invRes.invoices);

          // Check URL query for direct invoice link ?invoice=...
          const params = new URLSearchParams(window.location.search);
          const invoiceIdParam = params.get('invoice');
          if (invoiceIdParam) {
            const matched = invRes.invoices.find(i => i.id === invoiceIdParam);
            if (matched) {
              setSelectedInvoice(matched);
              setCurrentView('checkout');
            }
          }
        }
        if (tokRes.tokens) {
          setTokensData({
            tokens: tokRes.tokens,
            chains: tokRes.chains || []
          });
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }

    loadData();
  }, [merchantConfig.auroraApiKey]);

  // Handle create invoice
  const handleCreateInvoice = async (invoiceData) => {
    const res = await apiCreateInvoice(invoiceData);
    if (res.success && res.invoice) {
      setInvoices(prev => [res.invoice, ...prev]);
      setSelectedInvoice(res.invoice);
      setCurrentView('checkout');
    }
  };

  // Open receipt modal
  const handleOpenReceipt = (invoice) => {
    setReceiptInvoice(invoice);
    setIsReceiptOpen(true);
  };

  // Select invoice for checkout
  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setCurrentView('checkout');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Polite live region for screen readers per Modern Web Guidance */}
      <div aria-live="polite" className="sr-only" id="global-announcer"></div>

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        fxRates={fxRates}
        merchantConfig={merchantConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeInvoice={selectedInvoice}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'merchant' ? (
          <MerchantDashboard
            invoices={invoices}
            fxRates={fxRates}
            merchantConfig={merchantConfig}
            onOpenCreateInvoice={() => setIsCreateOpen(true)}
            onSelectInvoice={handleSelectInvoice}
            onOpenReceipt={handleOpenReceipt}
          />
        ) : (
          <CustomerCheckout
            invoice={selectedInvoice}
            invoices={invoices}
            tokens={tokensData.tokens}
            chains={tokensData.chains}
            merchantConfig={merchantConfig}
            onBackToDashboard={() => setCurrentView('merchant')}
            onSelectAnotherInvoice={(inv) => setSelectedInvoice(inv)}
            onOpenReceipt={handleOpenReceipt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">DashPay</span>
            <span>•</span>
            <span>Powered by <a href="https://docs.intents.aurora.dev" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Aurora Intents API</a></span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Costa Rican & Salvadoran Colones (CRC / SVC)</span>
            <span>•</span>
            <span>Gambian Dalasi (GMD)</span>
            <span>•</span>
            <span>Euro (EUR)</span>
            <span>•</span>
            <span className="text-purple-400 font-mono font-medium">Settled on Polygon (137)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fxRates={fxRates}
        merchantConfig={merchantConfig}
        onCreateInvoice={handleCreateInvoice}
      />

      <MerchantSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={merchantConfig}
        onSave={(newCfg) => setMerchantConfig(prev => ({ ...prev, ...newCfg }))}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={receiptInvoice}
      />

    </div>
  );
}

export default App;
