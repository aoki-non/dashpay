import express from 'express';
import { getSupportedTokens } from '../services/auroraIntents.js';

const router = express.Router();

/**
 * GET /api/tokens - Get all supported tokens and blockchains from Aurora Intents
 */
router.get('/', async (req, res) => {
  try {
    const apiKey = req.query.apiKey || '';
    const data = await getSupportedTokens(apiKey);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

