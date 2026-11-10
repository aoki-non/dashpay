import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MerchantDashboard } from './components/MerchantDashboard';
import { CustomerCheckout } from './components/CustomerCheckout';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { MerchantSettingsModal } from './components/MerchantSettingsModal';
import { ReceiptModal } from './components/ReceiptModal';
import { fetchFxRates, fetchInvoices, fetchSupportedTokens, createInvoice as apiCreateInvoice } from './services/api';
import { initNimiqEnvironment, connectNimiqEvmWallet, getPolygonUsdtBalance } from './services/nimiqWallet';

export function App() {
  const [currentView, setCurrentView] = useState('merchant'); // 'merchant' | 'checkout'
  const [fxRates, setFxRates] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [tokensData, setTokensData] = useState({ tokens: [], chains: [] });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // Nimiq Pay Wallet State
  const [merchantAddress, setMerchantAddress] = useState('');
  const [polygonUsdtBalance, setPolygonUsdtBalance] = useState('0.00');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isNimiqApp, setIsNimiqApp] = useState(false);

  // Merchant config
  const [merchantConfig, setMerchantConfig] = useState({
    name: 'Nimiq Pay Merchant',
    polygonAddress: '',
    auroraApiKey: ''
  });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Connect Nimiq Wallet callback
  const handleConnectWallet = useCallback(async () => {
    try {
      setIsConnectingWallet(true);
      const address = await connectNimiqEvmWallet();
      setMerchantAddress(address);
      setMerchantConfig(prev => ({ ...prev, polygonAddress: address }));

      // Fetch live USDT balance on Polygon
      const bal = await getPolygonUsdtBalance(address);
      setPolygonUsdtBalance(bal);
      return address;
    } catch (err) {
      console.warn('Wallet connect failed:', err.message);
    } finally {
      setIsConnectingWallet(false);
    }
    return '';
  }, []);

  // Initialize Nimiq environment on mount
  useEffect(() => {
    async function init() {
      const { isNimiqPay } = await initNimiqEnvironment();
      setIsNimiqApp(isNimiqPay);

      // Auto-connect if window.ethereum is already unlocked or inside Nimiq Pay
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            setMerchantAddress(addr);
            setMerchantConfig(prev => ({ ...prev, polygonAddress: addr }));
            const bal = await getPolygonUsdtBalance(addr);
            setPolygonUsdtBalance(bal);
          }
        } catch {}
      }
    }

    init();
  }, []);

  // Load backend data (FX rates, Invoices, Tokens)
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

          // Support direct invoice URL ?invoice=...
          const params = new URLSearchParams(window.location.search);
          const invIdParam = params.get('invoice');
          if (invIdParam) {
            const found = invRes.invoices.find(i => i.id === invIdParam);
            if (found) {
              setSelectedInvoice(found);
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

  // Refresh balance when invoice is paid
  const refreshBalance = useCallback(async () => {
    if (merchantAddress) {
      const bal = await getPolygonUsdtBalance(merchantAddress);
      setPolygonUsdtBalance(bal);
    }
  }, [merchantAddress]);

  const handleCreateInvoice = async (invoiceData) => {
    const res = await apiCreateInvoice({
      ...invoiceData,
      merchantPolygonAddress: merchantAddress || merchantConfig.polygonAddress
    });
    if (res.success && res.invoice) {
      setInvoices(prev => [res.invoice, ...prev]);
      setSelectedInvoice(res.invoice);
      setCurrentView('checkout');
    }
  };

  const handleOpenReceipt = (invoice) => {
    setReceiptInvoice(invoice);
    setIsReceiptOpen(true);
    refreshBalance();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Polite live region for screen readers */}
      <div aria-live="polite" className="sr-only" id="global-announcer"></div>

      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        fxRates={fxRates}
        merchantAddress={merchantAddress}
        polygonUsdtBalance={polygonUsdtBalance}
        isConnectingWallet={isConnectingWallet}
        onConnectWallet={handleConnectWallet}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeInvoice={selectedInvoice}
        isNimiqApp={isNimiqApp}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'merchant' ? (
          <MerchantDashboard
            invoices={invoices}
            fxRates={fxRates}
            merchantAddress={merchantAddress}
            polygonUsdtBalance={polygonUsdtBalance}
            isConnectingWallet={isConnectingWallet}
            onConnectWallet={handleConnectWallet}
            onOpenCreateInvoice={() => setIsCreateOpen(true)}
            onSelectInvoice={(inv) => {
              setSelectedInvoice(inv);
              setCurrentView('checkout');
            }}
            onOpenReceipt={handleOpenReceipt}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <CustomerCheckout
            invoice={selectedInvoice}
            invoices={invoices}
            tokens={tokensData.tokens}
            chains={tokensData.chains}
            merchantConfig={{
              ...merchantConfig,
              polygonAddress: merchantAddress || merchantConfig.polygonAddress
            }}
            onBackToDashboard={() => setCurrentView('merchant')}
            onSelectAnotherInvoice={(inv) => setSelectedInvoice(inv)}
            onOpenReceipt={handleOpenReceipt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Nimiq Pay Mini-App</span>
            <span>•</span>
            <span>Powered by <a href="https://docs.intents.aurora.dev" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Aurora Intents</a></span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Costa Rican & Salvadoran Colones (CRC/SVC)</span>
            <span>•</span>
            <span>Gambian Dalasi (GMD)</span>
            <span>•</span>
            <span>Euros (EUR)</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-bold">Settles in USDT on Polygon</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fxRates={fxRates}
        merchantAddress={merchantAddress || merchantConfig.polygonAddress}
        onCreateInvoice={handleCreateInvoice}
        onConnectWallet={handleConnectWallet}
      />

      <MerchantSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={{
          ...merchantConfig,
          polygonAddress: merchantAddress || merchantConfig.polygonAddress
        }}
        onSave={(newCfg) => {
          setMerchantConfig(newCfg);
          if (newCfg.polygonAddress) setMerchantAddress(newCfg.polygonAddress);
        }}
        onConnectWallet={handleConnectWallet}
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
