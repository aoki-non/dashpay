import express from 'express';
import { requestQuote } from '../services/auroraIntents.js';
import { getInvoice, updateInvoice } from '../services/invoiceStore.js';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * POST /api/quote/for-invoice - Generate quote directly for a specific invoice
 */
router.post('/for-invoice', async (req, res) => {
  try {
    const { invoiceId, originAsset, refundTo, slippageTolerance = 100, apiKey = '', dry = false } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ success: false, error: 'invoiceId is required' });
    }
    if (!originAsset) {
      return res.status(400).json({ success: false, error: 'originAsset (payer token) is required' });
    }
    if (!refundTo) {
      return res.status(400).json({ success: false, error: 'refundTo (payer origin chain refund address) is required' });
    }

    const invoice = getInvoice(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Amount in micro-units (6 decimals)
    const amount = invoice.stablecoinUnits;
    const destinationAsset = invoice.stablecoinAssetId;
    const recipient = invoice.merchantPolygonAddress;

    const quoteResponse = await requestQuote({
      originAsset,
      destinationAsset,
      amount,
      recipient,
      refundTo,
      slippageTolerance,
      apiKey,
      dry
    });

    // Update invoice with the active quote and set status to QUOTED
    updateInvoice(invoiceId, {
      status: dry ? invoice.status : 'QUOTED',
      activeQuote: {
        ...quoteResponse,
        requestedOriginAsset: originAsset,
        refundTo,
        slippageTolerance,
        quotedAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      invoiceId,
      quote: quoteResponse
    });
  } catch (err) {
    console.error('Error generating quote for invoice:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/quote - Generic quote generator
 */
router.post('/', async (req, res) => {
  try {
    const {
      originAsset,
      destinationAsset,
      amount,
      recipient,
      refundTo,
      slippageTolerance = 100,
      apiKey = '',
      dry = false
    } = req.body;

    const quoteResponse = await requestQuote({
      originAsset,
      destinationAsset,
      amount,
      recipient,
      refundTo,
      slippageTolerance,
      apiKey,
      dry
    });

    res.json({ success: true, quote: quoteResponse });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
