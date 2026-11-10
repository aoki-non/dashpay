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
      fiatCurrency,
      fiatAmount,
      description,
      customerEmail,
      metadata
    } = req.body;

    if (!merchantPolygonAddress || !/^0x[a-fA-F0-9]{40}$/.test(merchantPolygonAddress)) {
      return res.status(400).json({
        success: false,
        error: 'A valid Polygon (EVM) recipient address is required to receive USDT settlement.'
      });
    }

    const invoice = await createInvoice({
      merchantName: merchantName || 'Nimiq Pay Merchant',
      merchantPolygonAddress,
      fiatCurrency: fiatCurrency || 'CRC',
      fiatAmount,
      description: description || 'Nimiq Pay Checkout',
      customerEmail,
      metadata
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
