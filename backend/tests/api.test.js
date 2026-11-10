import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Isolate invoice persistence before the store module loads.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashpay-test-'));
process.env.INVOICE_STORE_PATH = path.join(tmpDir, 'invoices.json');

const { default: fxRoutes } = await import('../routes/fx.js');
const { default: invoiceRoutes } = await import('../routes/invoices.js');
const { createInvoice, getInvoice, listInvoices, updateInvoice } = await import(
  '../services/invoiceStore.js'
);
const { convertFiatToStablecoin } = await import('../services/fxRates.js');

const TEST_ADDRESS = '0x71c7656ec7ab88b098defb751b7401b5f6d8976f';

/**
 * Invoke an Express router directly (no TCP listener needed).
 */
function callRouter(router, { method, url, query = {}, body }) {
  return new Promise((resolve, reject) => {
    const req = { method, url, query, body, params: {}, headers: {} };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ status: this.statusCode, body: payload });
        return this;
      }
    };
    try {
      const maybePromise = router(req, res, (err) =>
        err ? reject(err) : reject(new Error(`No route matched ${method} ${url}`))
      );
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}

describe('GET /api/fx/rates', () => {
  it('exposes rates and polygon settlement info', async () => {
    const { status, body } = await callRouter(fxRoutes, {
      method: 'GET',
      url: '/rates'
    });
    assert.equal(status, 200);
    assert.equal(body.success, true);
    assert.ok(body.rates && typeof body.rates.CRC === 'number');
    assert.ok(body.rates && typeof body.rates.EUR === 'number');
    // Regression: route once read a config key that does not exist.
    assert.ok(
      body.polygonStablecoins,
      'polygonStablecoins must be defined in the FX rates response'
    );
  });
});

describe('POST /api/fx/convert', () => {
  it('rejects missing fields with 400', async () => {
    const { status } = await callRouter(fxRoutes, {
      method: 'POST',
      url: '/convert',
      body: { amount: 100 }
    });
    assert.equal(status, 400);
  });

  it('converts fiat with consistent 6-decimal units', async () => {
    const { status, body } = await callRouter(fxRoutes, {
      method: 'POST',
      url: '/convert',
      body: { amount: 100, currency: 'EUR' }
    });
    assert.equal(status, 200);
    assert.equal(body.success, true);
    assert.equal(body.fiatCurrency, 'EUR');
    assert.equal(
      body.stablecoinUnits,
      Math.round(body.usdAmount * 1_000_000).toString()
    );
  });
});

describe('convertFiatToStablecoin', () => {
  it('rejects unsupported currencies', async () => {
    await assert.rejects(
      () => convertFiatToStablecoin(100, 'JPY'),
      /Unsupported fiat currency/
    );
  });

  it('honors the statutory SVC peg', async () => {
    const result = await convertFiatToStablecoin(87.5, 'SVC');
    assert.equal(result.rateToUsd, 8.75);
    assert.equal(result.usdAmount, 10);
  });
});

describe('invoice store', () => {
  it('rejects an invalid Polygon address', async () => {
    await assert.rejects(
      () =>
        createInvoice({
          merchantPolygonAddress: '0xbad',
          fiatCurrency: 'CRC',
          fiatAmount: 1000
        }),
      /Valid Polygon/
    );
  });

  it('rejects a non-positive amount', async () => {
    await assert.rejects(
      () =>
        createInvoice({
          merchantPolygonAddress: TEST_ADDRESS,
          fiatCurrency: 'CRC',
          fiatAmount: 0
        }),
      /greater than 0/
    );
  });

  it('creates, retrieves, updates, and persists invoices', async () => {
    const invoice = await createInvoice({
      merchantPolygonAddress: TEST_ADDRESS,
      fiatCurrency: 'CRC',
      fiatAmount: 15000
    });
    assert.ok(invoice.id);
    assert.equal(invoice.status, 'PENDING');
    assert.equal(getInvoice(invoice.id).id, invoice.id);
    assert.ok(listInvoices().some((entry) => entry.id === invoice.id));

    updateInvoice(invoice.id, { status: 'QUOTED' });
    assert.equal(getInvoice(invoice.id).status, 'QUOTED');

    // Regression: invoices must survive a server restart.
    const persisted = JSON.parse(
      fs.readFileSync(process.env.INVOICE_STORE_PATH, 'utf8')
    );
    const saved = persisted.find((entry) => entry.id === invoice.id);
    assert.ok(saved, 'invoice must be written to the persistence file');
    assert.equal(saved.status, 'QUOTED');
  });
});

describe('POST /api/invoices', () => {
  it('rejects an invalid Polygon address with 400', async () => {
    const { status, body } = await callRouter(invoiceRoutes, {
      method: 'POST',
      url: '/',
      body: {
        fiatCurrency: 'CRC',
        fiatAmount: 15000,
        merchantPolygonAddress: 'not-an-address'
      }
    });
    assert.equal(status, 400);
    assert.equal(body.success, false);
  });
});
