import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { convertFiatToStablecoin } from './fxRates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File-backed persistence so invoices (and their share links) survive restarts.
// Overridable for tests via INVOICE_STORE_PATH.
const STORE_PATH =
  process.env.INVOICE_STORE_PATH || path.join(__dirname, '..', 'data', 'invoices.json');

const invoices = new Map();

function loadFromDisk() {
  try {
    if (!fs.existsSync(STORE_PATH)) return;
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    for (const invoice of list) {
      if (invoice && invoice.id) invoices.set(invoice.id, invoice);
    }
  } catch (err) {
    console.warn('Could not load persisted invoices:', err.message);
  }
}

function persistToDisk() {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    const tmpPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(Array.from(invoices.values()), null, 2));
    fs.renameSync(tmpPath, STORE_PATH);
  } catch (err) {
    console.warn('Could not persist invoices:', err.message);
  }
}

loadFromDisk();

function generateInvoiceId() {
  const prefix = 'nim';
  const randomStr = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}_${timestamp}_${randomStr}`;
}

export async function createInvoice({
  merchantName = 'DashPay Merchant',
  merchantPolygonAddress,
  fiatCurrency = 'CRC',
  fiatAmount,
  description = 'Order Checkout',
  customerEmail = '',
  metadata = {}
}) {
  if (!merchantPolygonAddress || !/^0x[a-fA-F0-9]{40}$/.test(merchantPolygonAddress)) {
    throw new Error('Valid Polygon (EVM) recipient address is required');
  }

  if (!fiatAmount || Number(fiatAmount) <= 0) {
    throw new Error('Valid fiatAmount is required and must be greater than 0');
  }

  const usdtConfig = CONFIG.POLYGON.usdt;
  const conversion = await convertFiatToStablecoin(Number(fiatAmount), fiatCurrency);

  const id = generateInvoiceId();
  const now = new Date().toISOString();

  const invoice = {
    id,
    merchantName,
    merchantPolygonAddress,
    stablecoin: usdtConfig.symbol, // USDT
    stablecoinName: usdtConfig.name,
    stablecoinAssetId: usdtConfig.assetId,
    stablecoinContract: usdtConfig.contractAddress,
    stablecoinDecimals: usdtConfig.decimals,
    destinationChain: 'Polygon PoS (Matic)',
    destinationChainId: CONFIG.POLYGON.chainId,
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
    status: 'PENDING', // PENDING | QUOTED | KNOWN_DEPOSIT | PROCESSING | SUCCESS
    activeQuote: null,
    paymentDetails: null,
    createdAt: now,
    updatedAt: now
  };

  invoices.set(id, invoice);
  persistToDisk();
  return invoice;
}

export function getInvoice(id) {
  return invoices.get(id) || null;
}

export function listInvoices() {
  return Array.from(invoices.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateInvoice(id, updates) {
  const existing = invoices.get(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  invoices.set(id, updated);
  persistToDisk();
  return updated;
}
