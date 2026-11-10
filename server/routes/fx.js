import express from 'express';
import { getFxRates, convertFiatToStablecoin } from '../services/fxRates.js';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * GET /api/fx/rates - Get current FX rates for supported currencies
 */
router.get('/rates', async (req, res) => {
  try {
    const { rates, cached, timestamp } = await getFxRates();
    res.json({
      success: true,
      rates,
      currencies: CONFIG.SUPPORTED_FIAT,
      polygonStablecoins: CONFIG.POLYGON_STABLECOINS,
      cached,
      timestamp
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/fx/convert - Convert amount in Colones, Dalasi or Euros to USD/Polygon stablecoin
 */
router.post('/convert', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ success: false, error: 'Amount and currency are required' });
    }
    const result = await convertFiatToStablecoin(Number(amount), currency);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
