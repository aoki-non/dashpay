import express from 'express';
import crypto from 'crypto';
import { getInvoice, updateInvoice } from '../services/invoiceStore.js';

const router = express.Router();

// Active simulations
const activeSimulations = new Map();

/**
 * POST /api/simulate/advance - Advance simulation for an invoice
 */
router.post('/advance', async (req, res) => {
  try {
    const { invoiceId, step } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ success: false, error: 'invoiceId is required' });
    }

    const invoice = getInvoice(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const txHashPolygon = '0x' + crypto.randomBytes(32).toString('hex');
    const txHashOrigin = '0x' + crypto.randomBytes(32).toString('hex');
    const intentHash = crypto.randomBytes(24).toString('base64url');

    let updatedStatus = 'PROCESSING';
    let rawStatus = 'PROCESSING';

    if (step === 'detected') {
      updatedStatus = 'KNOWN_DEPOSIT';
      rawStatus = 'KNOWN_DEPOSIT_TX';
    } else if (step === 'processing') {
      updatedStatus = 'PROCESSING';
      rawStatus = 'PROCESSING';
    } else if (step === 'success' || !step) {
      updatedStatus = 'COMPLETED';
      rawStatus = 'SUCCESS';
    }

    const updated = updateInvoice(invoiceId, {
      status: updatedStatus,
      paymentDetails: {
        status: rawStatus,
        updatedAt: new Date().toISOString(),
        isSimulated: true,
        swapDetails: {
          depositedAmount: invoice.activeQuote?.quote?.amountIn || '100000',
          depositedAmountFormatted: invoice.activeQuote?.quote?.amountInFormatted || '0.5',
          amountOut: invoice.stablecoinUnits,
          amountOutFormatted: (Number(invoice.stablecoinUnits) / 1_000_000).toFixed(2),
          originChainTxHashes: [txHashOrigin],
          destinationChainTxHashes: [txHashPolygon],
          intentHashes: [intentHash],
          withdrawFee: invoice.activeQuote?.quote?.withdrawFee || '4200'
        },
        destinationTx: txHashPolygon,
        originTx: txHashOrigin
      }
    });

    res.json({
      success: true,
      simulated: true,
      invoice: updated,
      status: rawStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
