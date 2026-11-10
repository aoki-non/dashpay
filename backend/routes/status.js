import express from 'express';
import { getSwapStatus } from '../services/auroraIntents.js';
import { getInvoice, updateInvoice, listInvoices } from '../services/invoiceStore.js';

const router = express.Router();

/**
 * GET /api/status - Check execution status of a swap via deposit address
 */
router.get('/', async (req, res) => {
  try {
    const { depositAddress, depositMemo, apiKey = '', invoiceId } = req.query;

    if (!depositAddress) {
      return res.status(400).json({ success: false, error: 'depositAddress query param is required' });
    }

    const statusData = await getSwapStatus(depositAddress, depositMemo, apiKey);

    // If an invoice is tied to this deposit, update its status
    let matchedInvoice = null;
    if (invoiceId) {
      matchedInvoice = getInvoice(invoiceId);
    } else {
      // Find invoice with this deposit address
      const all = listInvoices();
      matchedInvoice = all.find(inv => inv.activeQuote?.quote?.depositAddress === depositAddress);
    }

    if (matchedInvoice) {
      let newInvoiceStatus = matchedInvoice.status;
      if (statusData.status === 'SUCCESS') {
        newInvoiceStatus = 'COMPLETED';
      } else if (statusData.status === 'PROCESSING') {
        newInvoiceStatus = 'PROCESSING';
      } else if (statusData.status === 'KNOWN_DEPOSIT_TX') {
        newInvoiceStatus = 'KNOWN_DEPOSIT';
      } else if (statusData.status === 'FAILED' || statusData.status === 'REFUNDED') {
        newInvoiceStatus = statusData.status;
      }

      updateInvoice(matchedInvoice.id, {
        status: newInvoiceStatus,
        paymentDetails: {
          status: statusData.status,
          updatedAt: statusData.updatedAt,
          swapDetails: statusData.swapDetails,
          destinationTx: statusData.swapDetails?.destinationChainTxHashes?.[0] || null,
          originTx: statusData.swapDetails?.originChainTxHashes?.[0] || null
        }
      });
    }

    res.json({
      success: true,
      data: statusData,
      invoice: matchedInvoice ? getInvoice(matchedInvoice.id) : null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

