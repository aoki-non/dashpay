import { CONFIG } from '../config.js';

let cachedRates = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Fallback rates if external API is temporarily unreachable
const FALLBACK_RATES = {
  CRC: 512.50, // Costa Rican Colón per USD
  SVC: 8.75,   // Salvadoran Colón per USD
  GMD: 71.20,  // Gambian Dalasi per USD
  EUR: 0.92,   // Euro per USD
  USD: 1.00
};

export async function getFxRates() {
  const now = Date.now();
  if (cachedRates && (now - lastFetchedAt) < CACHE_TTL_MS) {
    return { rates: cachedRates, cached: true, timestamp: lastFetchedAt };
  }

  try {
    const res = await fetch(CONFIG.FX_RATES_API, {
      headers: { 'User-Agent': 'DashPay-Merchant-Gateway/1.0' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      throw new Error(`FX API responded with status ${res.status}`);
    }
    const data = await res.json();
    const liveRates = data.rates || {};

    cachedRates = {
      CRC: liveRates.CRC || FALLBACK_RATES.CRC,
      SVC: FALLBACK_RATES.SVC, // El Salvador Colón statutory peg
      GMD: liveRates.GMD || FALLBACK_RATES.GMD,
      EUR: liveRates.EUR || FALLBACK_RATES.EUR,
      USD: 1.00
    };
    lastFetchedAt = now;
    return { rates: cachedRates, cached: false, timestamp: lastFetchedAt };
  } catch (err) {
    console.warn('Failed to fetch live FX rates, using fallback rates:', err.message);
    if (!cachedRates) {
      cachedRates = { ...FALLBACK_RATES };
      lastFetchedAt = now;
    }
    return { rates: cachedRates, cached: true, fallback: true, timestamp: lastFetchedAt };
  }
}

/**
 * Convert an amount in local fiat (CRC, SVC, GMD, EUR) to USD / Polygon stablecoin.
 * @param {number} amount - Amount in fiat currency
 * @param {string} currency - 'CRC' | 'SVC' | 'GMD' | 'EUR'
 * @returns {Promise<{ usdAmount: number, rate: number, stablecoinUnits: string }>}
 */
export async function convertFiatToStablecoin(amount, currency) {
  const currencyKey = currency.toUpperCase();
  const configFiat = CONFIG.SUPPORTED_FIAT[currencyKey];
  if (!configFiat) {
    throw new Error(`Unsupported fiat currency: ${currency}. Supported: CRC, SVC, GMD, EUR`);
  }

  const { rates } = await getFxRates();
  const rate = rates[currencyKey];
  if (!rate || rate <= 0) {
    throw new Error(`No exchange rate found for currency ${currencyKey}`);
  }

  // Rate is: units of Fiat per 1 USD
  // Therefore: USD = Fiat Amount / Rate
  const usdAmount = Number((amount / rate).toFixed(6));
  
  // Decimals for Polygon USDC / USDT is 6
  // Smallest unit is micro-dollars (10^-6)
  const stablecoinUnits = Math.round(usdAmount * 1_000_000).toString();

  return {
    fiatAmount: Number(amount),
    fiatCurrency: currencyKey,
    fiatSymbol: configFiat.symbol,
    rateToUsd: rate,
    usdAmount,
    stablecoinUnits,
    timestamp: new Date().toISOString()
  };
}

