import express from 'express';
import { createInvoice, getInvoice, listInvoices, updateInvoice } from '../services/invoiceStore.js';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * GET /api/invoices - List all invoices
 */
router.get('/', (req, res) => {
  try {
    const list = listInvoices();
    res.json({ success: true, invoices: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/invoices/:id - Get single invoice by ID
 */
router.get('/:id', (req, res) => {
  try {
    const invoice = getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/invoices - Create new invoice
 */
router.post('/', async (req, res) => {
  try {
    const {
      merchantName,
      merchantPolygonAddress,
      stablecoin,
      fiatCurrency,
      fiatAmount,
      description,
      customerEmail,
      metadata
    } = req.body;

    // Validate Polygon address if provided
    if (merchantPolygonAddress && !/^0x[a-fA-F0-9]{40}$/.test(merchantPolygonAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Polygon recipient address. Must be a valid 0x EVM address.'
      });
    }

    const invoice = await createInvoice({
      merchantName: merchantName || CONFIG.DEFAULT_MERCHANT.name,
      merchantPolygonAddress: merchantPolygonAddress || CONFIG.DEFAULT_MERCHANT.polygonAddress,
      stablecoin: stablecoin || 'USDC',
      fiatCurrency: fiatCurrency || 'CRC',
      fiatAmount,
      description: description || 'Merchant Checkout Order',
      customerEmail,
      metadata
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
