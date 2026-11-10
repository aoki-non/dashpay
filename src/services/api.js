const API_BASE = '/api';

/**
 * Fetch live exchange rates for Colones, Dalasi, and Euros
 */
export async function fetchFxRates() {
  const res = await fetch(`${API_BASE}/fx/rates`);
  if (!res.ok) throw new Error('Failed to fetch FX rates');
  return res.json();
}

/**
 * Convert fiat amount to USD / Polygon stablecoin
 */
export async function convertFiat(amount, currency) {
  const res = await fetch(`${API_BASE}/fx/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Conversion failed');
  }
  return res.json();
}

/**
 * Fetch all invoices for the merchant
 */
export async function fetchInvoices() {
  const res = await fetch(`${API_BASE}/invoices`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

/**
 * Fetch single invoice by ID
 */
export async function fetchInvoiceById(id) {
  const res = await fetch(`${API_BASE}/invoices/${id}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invoice not found');
  }
  return res.json();
}

/**
 * Create a new invoice
 */
export async function createInvoice(invoiceData) {
  const res = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create invoice');
  }
  return res.json();
}

/**
 * Fetch supported cross-chain tokens from Aurora Intents
 */
export async function fetchSupportedTokens(apiKey = '') {
  let url = `${API_BASE}/tokens`;
  if (apiKey) url += `?apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch supported tokens');
  return res.json();
}

/**
 * Request cross-chain exact-output quote for an invoice
 */
export async function requestQuoteForInvoice({ invoiceId, originAsset, refundTo, slippageTolerance = 100, apiKey = '', dry = false }) {
  const res = await fetch(`${API_BASE}/quote/for-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId, originAsset, refundTo, slippageTolerance, apiKey, dry })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Quote request failed');
  }
  return res.json();
}

/**
 * Check execution status of a swap
 */
export async function fetchSwapStatus({ depositAddress, depositMemo, invoiceId, apiKey = '' }) {
  let url = `${API_BASE}/status?depositAddress=${encodeURIComponent(depositAddress)}`;
  if (depositMemo) url += `&depositMemo=${encodeURIComponent(depositMemo)}`;
  if (invoiceId) url += `&invoiceId=${encodeURIComponent(invoiceId)}`;
  if (apiKey) url += `&apiKey=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch status');
  }
  return res.json();
}

/**
 * Simulate payment progression in Demo Mode
 */
export async function advanceSimulation(invoiceId, step) {
  const res = await fetch(`${API_BASE}/simulate/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId, step })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Simulation failed');
  }
  return res.json();
}
