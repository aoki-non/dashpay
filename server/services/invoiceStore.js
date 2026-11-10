import crypto from 'crypto';
import { CONFIG } from '../config.js';
import { convertFiatToStablecoin } from './fxRates.js';

const invoices = new Map();

function generateInvoiceId() {
  const prefix = 'nim';
  const randomStr = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}_${timestamp}_${randomStr}`;
}

export async function createInvoice({
  merchantName = 'Nimiq Pay Merchant',
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
  return updated;
}
