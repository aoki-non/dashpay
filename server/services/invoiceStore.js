import crypto from 'crypto';
import { CONFIG } from '../config.js';
import { convertFiatToStablecoin } from './fxRates.js';

// In-memory invoice store (persisted in RAM for development/runtime)
const invoices = new Map();

/**
 * Generate a random friendly invoice reference
 */
function generateInvoiceId() {
  const prefix = 'inv';
  const randomStr = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Create a new merchant invoice
 */
export async function createInvoice({
  merchantName = CONFIG.DEFAULT_MERCHANT.name,
  merchantPolygonAddress = CONFIG.DEFAULT_MERCHANT.polygonAddress,
  stablecoin = 'USDC',
  fiatCurrency = 'CRC',
  fiatAmount,
  description = 'Order Checkout',
  customerEmail = '',
  metadata = {}
}) {
  if (!fiatAmount || Number(fiatAmount) <= 0) {
    throw new Error('Valid fiatAmount is required and must be greater than 0');
  }

  const selectedStablecoin = CONFIG.POLYGON_STABLECOINS[stablecoin.toUpperCase()] || CONFIG.POLYGON_STABLECOINS.USDC;

  // Convert fiat to stablecoins via FX rates
  const conversion = await convertFiatToStablecoin(Number(fiatAmount), fiatCurrency);

  const id = generateInvoiceId();
  const now = new Date().toISOString();

  const invoice = {
    id,
    merchantName,
    merchantPolygonAddress,
    stablecoin: selectedStablecoin.symbol,
    stablecoinName: selectedStablecoin.name,
    stablecoinAssetId: selectedStablecoin.assetId,
    stablecoinContract: selectedStablecoin.contractAddress,
    stablecoinDecimals: selectedStablecoin.decimals,
    destinationChain: 'Polygon (PoS)',
    destinationChainId: 137,
    fiatCurrency: conversion.fiatCurrency,
    fiatSymbol: conversion.fiatSymbol,
    fiatAmount: conversion.fiatAmount,
    rateToUsd: conversion.rateToUsd,
    usdAmount: conversion.usdAmount,
    targetStablecoinAmount: conversion.usdAmount,
    stablecoinUnits: conversion.stablecoinUnits,
    description,
    customerEmail,
    metadata,
    status: 'PENDING', // PENDING | QUOTED | KNOWN_DEPOSIT | PROCESSING | COMPLETED | EXPIRED
    activeQuote: null,
    paymentDetails: null,
    createdAt: now,
    updatedAt: now
  };

  invoices.set(id, invoice);
  return invoice;
}

/**
 * Get invoice by ID
 */
export function getInvoice(id) {
  return invoices.get(id) || null;
}

/**
 * List all invoices (sorted newest first)
 */
export function listInvoices() {
  return Array.from(invoices.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update an invoice
 */
export function updateInvoice(id, updates) {
  const existing = invoices.get(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  invoices.set(id, updated);
  return updated;
}

/**
 * Seed initial realistic demo invoices in Colones, Dalasi, and Euros
 */
export async function seedInitialInvoices() {
  if (invoices.size > 0) return;

  try {
    // 1. Costa Rican Colones invoice
    await createInvoice({
      merchantName: 'Café Monteverde Artisan Roasters',
      merchantPolygonAddress: CONFIG.DEFAULT_MERCHANT.polygonAddress,
      stablecoin: 'USDC',
      fiatCurrency: 'CRC',
      fiatAmount: 18500, // ~36 USD
      description: '2x Geisha Special Reserve Coffee Beans + Shipping',
      customerEmail: 'alex.traveler@example.com'
    });

    // 2. Gambian Dalasi invoice
    await createInvoice({
      merchantName: 'Banjul River Crafts & Textiles',
      merchantPolygonAddress: CONFIG.DEFAULT_MERCHANT.polygonAddress,
      stablecoin: 'USDC',
      fiatCurrency: 'GMD',
      fiatAmount: 1250, // ~17.50 USD
      description: 'Handwoven Gambian Kente Cloth Tapestry',
      customerEmail: 'mariama@example.org'
    });

    // 3. Euro invoice
    await createInvoice({
      merchantName: 'Atelier de Lyon Leatherworks',
      merchantPolygonAddress: CONFIG.DEFAULT_MERCHANT.polygonAddress,
      stablecoin: 'USDT',
      fiatCurrency: 'EUR',
      fiatAmount: 48.50, // ~52.70 USD
      description: 'Full-Grain Passport Wallet (Cognac Edition)',
      customerEmail: 'julien.moreau@example.fr'
    });

    // 4. Salvadoran Colón invoice
    await createInvoice({
      merchantName: 'Ruta de Las Flores Organic Honey',
      merchantPolygonAddress: CONFIG.DEFAULT_MERCHANT.polygonAddress,
      stablecoin: 'USDC',
      fiatCurrency: 'SVC',
      fiatAmount: 175.00, // 20 USD at 8.75 peg
      description: 'Raw Wildflower Honey (3 x 500g Glass Jars)',
      customerEmail: 'carlos.m@example.sv'
    });

    console.log('Seeded demo invoices across Colones, Dalasi, and Euros.');
  } catch (err) {
    console.error('Error seeding invoices:', err);
  }
}
