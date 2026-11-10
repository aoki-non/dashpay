import React, { useState, useEffect, useCallback } from 'react';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavBar } from './components/BottomNavBar';
import { PosChargeScreen } from './components/PosChargeScreen';
import { ActivityScreen } from './components/ActivityScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CustomerCheckout } from './components/CustomerCheckout';
import { ReceiptModal } from './components/ReceiptModal';
import { fetchFxRates, fetchInvoices, fetchSupportedTokens, createInvoice as apiCreateInvoice } from './services/api';
import { initNimiqEnvironment, connectNimiqEvmWallet, getPolygonUsdtBalance } from './services/nimiqWallet';

export function App() {
  const [activeTab, setActiveTab] = useState('charge'); // 'charge' | 'activity' | 'settings' | 'checkout'
  const [fxRates, setFxRates] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [tokensData, setTokensData] = useState({ tokens: [], chains: [] });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // DashPay merchant wallet state
  const [merchantAddress, setMerchantAddress] = useState('');
  const [polygonUsdtBalance, setPolygonUsdtBalance] = useState('0.00');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isNimiqApp, setIsNimiqApp] = useState(false);

  // Quotes route through the public solver gateway, or the server-side
  // AURORA_INTENTS_API_KEY when the operator configures one.

  // Modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Connect merchant wallet
  const handleConnectWallet = useCallback(async () => {
    try {
      setIsConnectingWallet(true);
      const address = await connectNimiqEvmWallet();
      setMerchantAddress(address);
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

  // Initialize mini-app environment on mount
  useEffect(() => {
    async function init() {
      const { isNimiqPay } = await initNimiqEnvironment();
      setIsNimiqApp(isNimiqPay);

      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            setMerchantAddress(addr);
            const bal = await getPolygonUsdtBalance(addr);
            setPolygonUsdtBalance(bal);
          }
        } catch {}
      }
    }

    init();
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (merchantAddress) {
      const bal = await getPolygonUsdtBalance(merchantAddress);
      setPolygonUsdtBalance(bal);
    }
  }, [merchantAddress]);

  // Load backend data (FX rates, Invoices, Tokens)
  useEffect(() => {
    async function loadData() {
      try {
        const [fxRes, invRes, tokRes] = await Promise.all([
          fetchFxRates(),
          fetchInvoices(),
          fetchSupportedTokens()
        ]);

        if (fxRes.rates) setFxRates(fxRes);
        if (invRes.invoices) {
          setInvoices(invRes.invoices);

          // Support direct invoice link in URL: ?invoice=...
          const params = new URLSearchParams(window.location.search);
          const invIdParam = params.get('invoice');
          if (invIdParam) {
            const found = invRes.invoices.find(i => i.id === invIdParam);
            if (found) {
              setSelectedInvoice(found);
              setActiveTab('checkout');
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
  }, []);

  // Handle charge from POS Keypad. Throws on failure so the caller can
  // show the error; success navigates to checkout.
  const handleCharge = async (chargeData) => {
    try {
      const res = await apiCreateInvoice({
        ...chargeData,
        merchantPolygonAddress: merchantAddress
      });
      if (res.success && res.invoice) {
        setInvoices(prev => [res.invoice, ...prev]);
        setSelectedInvoice(res.invoice);
        setActiveTab('checkout');
        return res.invoice;
      }
      throw new Error('Invoice creation returned no invoice.');
    } catch (err) {
      console.error('Failed to create invoice:', err);
      throw err;
    }
  };

  const handleOpenReceipt = (invoice) => {
    setReceiptInvoice(invoice);
    setIsReceiptOpen(true);
    refreshBalance();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-sm mx-auto shadow-2xl border-x border-slate-900/80 relative font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      
      {/* Polite live region for screen readers */}
      <div aria-live="polite" className="sr-only" id="global-announcer"></div>

      {/* Mobile App Bar */}
      <MobileHeader
        merchantAddress={merchantAddress}
        polygonUsdtBalance={polygonUsdtBalance}
        onConnectWallet={handleConnectWallet}
        isConnectingWallet={isConnectingWallet}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col pt-2 pb-4">
        {activeTab === 'charge' && (
          <PosChargeScreen
            merchantAddress={merchantAddress}
            polygonUsdtBalance={polygonUsdtBalance}
            fxRates={fxRates}
            onCharge={handleCharge}
            onConnectWallet={handleConnectWallet}
            isConnectingWallet={isConnectingWallet}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityScreen
            invoices={invoices}
            onSelectInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveTab('checkout');
            }}
            onOpenReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            merchantAddress={merchantAddress}
            polygonUsdtBalance={polygonUsdtBalance}
            onConnectWallet={handleConnectWallet}
            isConnectingWallet={isConnectingWallet}
          />
        )}

        {activeTab === 'checkout' && selectedInvoice && (
          <CustomerCheckout
            invoice={selectedInvoice}
            tokens={tokensData.tokens}
            chains={tokensData.chains}
            onBackToDashboard={() => setActiveTab('charge')}
            onOpenReceipt={handleOpenReceipt}
          />
        )}
      </main>

      {/* Native Bottom App Bar */}
      <BottomNavBar
        activeTab={activeTab === 'checkout' ? 'charge' : activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
        }}
        invoiceCount={invoices.length}
      />

      {/* Celebration Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={receiptInvoice}
      />

    </div>
  );
}

export default App;
