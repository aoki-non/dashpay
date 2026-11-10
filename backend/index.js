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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DashPay Cross-Chain Merchant Gateway',
    timestamp: new Date().toISOString(),
    supportedFiat: Object.keys(CONFIG.SUPPORTED_FIAT),
    destinationChain: 'Polygon (137)',
    destinationToken: CONFIG.POLYGON.usdt,
    hasOfficialApiKey: Boolean(CONFIG.AURORA_INTENTS_API_KEY)
  });
});

// Serve frontend static build if it exists
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// For SPA routing in Express 5, catch-all middleware handles non-API GET requests.
// Missing static assets (paths with an extension) fall through to a 404 instead
// of receiving index.html, and a missing dist build no longer crashes the request.
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  if (path.extname(req.path)) {
    return next();
  }
  return res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

const server = app.listen(CONFIG.PORT, () => {
  console.log(`🚀 DashPay Gateway running on http://localhost:${CONFIG.PORT}`);
  console.log(`   - FX Endpoint: http://localhost:${CONFIG.PORT}/api/fx/rates`);
  console.log(`   - Invoices Endpoint: http://localhost:${CONFIG.PORT}/api/invoices`);
  console.log(`   - Tokens Endpoint: http://localhost:${CONFIG.PORT}/api/tokens`);
  console.log(`   - Settlement: USDT on Polygon (${CONFIG.POLYGON.usdt.contractAddress})`);
  console.log(`   - Aurora Intents Mode: ${CONFIG.AURORA_INTENTS_API_KEY ? 'Official API Key Configured' : 'Public Solver Gateway'}`);
});

export default app;
