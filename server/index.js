import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import fxRoutes from './routes/fx.js';
import invoiceRoutes from './routes/invoices.js';
import tokenRoutes from './routes/tokens.js';
import quoteRoutes from './routes/quote.js';
import statusRoutes from './routes/status.js';
import simulateRoutes from './routes/simulate.js';
import { seedInitialInvoices } from './services/invoiceStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/fx', fxRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/simulate', simulateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DashPay - Cross-Chain Merchant Gateway',
    timestamp: new Date().toISOString(),
    supportedFiat: Object.keys(CONFIG.SUPPORTED_FIAT),
    destinationChain: 'Polygon',
    supportedStablecoins: Object.keys(CONFIG.POLYGON_STABLECOINS)
  });
});

// Serve frontend static build if it exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA routing in Express 5, catch-all middleware handles non-API GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Seed demo data on start
seedInitialInvoices();

const server = app.listen(CONFIG.PORT, () => {
  console.log(`🚀 DashPay Server running on http://localhost:${CONFIG.PORT}`);
  console.log(`   - FX Endpoint: http://localhost:${CONFIG.PORT}/api/fx/rates`);
  console.log(`   - Invoices Endpoint: http://localhost:${CONFIG.PORT}/api/invoices`);
  console.log(`   - Tokens Endpoint: http://localhost:${CONFIG.PORT}/api/tokens`);
  console.log(`   - Aurora Intents Connected: ${CONFIG.AURORA_INTENTS_URL}`);
});

export default app;
