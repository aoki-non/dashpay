# DashPay — Cross-Chain Merchant Gateway

> **A merchant sets a price in colones, dalasi or euros. The payer pays with any token on any supported chain. The merchant receives stablecoins on Polygon.**  
> Powered by the [Aurora Intents API](https://docs.intents.aurora.dev/intents-deposits/quickstart/api-integration).

---

## 🌟 Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │                DashPay Gateway               │
                      └──────────────────────┬───────────────────────┘
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
┌─────▼─────────────────────────┐ ┌──────────▼────────────────────────┐ ┌───────────▼──────────────────────────┐
│        Merchant Portal        │ │        FX Rate Engine             │ │        Customer Checkout             │
│  - Set price in CRC, SVC,     │ │  - Real-time rates (open.er-api)  │ │  - Select any token (200+)           │
│    GMD or EUR                 │ │  - Live conversion to USD         │ │  - Any chain (Solana, Bitcoin,       │
│  - Select Polygon stablecoin  │ │  - In-memory cache & fallback     │ │    Ethereum, Base, Arbitrum, etc.)   │
│    (USDC or USDT)             │ └───────────────────────────────────┘ │  - Scan QR / Transfer to deposit addr │
│  - Set Polygon EVM address    │                                       │  - Live status tracking stepper        │
└─────────────┬─────────────────┘                                       └───────────┬──────────────────────────┘
              │                                                                     │
              └──────────────────────────────┬──────────────────────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │        Aurora Intents / 1Click Engine        │
                      │  POST /api/quote with EXACT_OUTPUT           │
                      │  originAsset: Payer's token (e.g. SOL, BTC)  │
                      │  destinationAsset: Polygon USDC / USDT       │
                      │  recipient: Merchant's Polygon Address       │
                      │  depositType: ORIGIN_CHAIN                   │
                      │  slippageTolerance: 100 (1%)                 │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │              Polygon PoS (137)               │
                      │  Merchant receives exact USDC/USDT payout    │
                      │  Verifiable on Polygonscan                   │
                      └──────────────────────────────────────────────┘
```

---

## 🚀 Key Capabilities

### 1. Multi-Fiat Merchant Pricing
Merchants can price orders in local currencies:
- 🇨🇷 **Costa Rican Colón (CRC)**: `₡` — Active national currency of Costa Rica.
- 🇸🇻 **Salvadoran Colón (SVC)**: `₡` — Pegged at 8.75 SVC / USD.
- 🇬🇲 **Gambian Dalasi (GMD)**: `D` — Active national currency of The Gambia.
- 🇪🇺 **Euro (EUR)**: `€` — Official currency of the Eurozone.

Live FX exchange rates convert the fiat amount into the exact USD / stablecoin amount needed.

### 2. Payout in Polygon Stablecoins
The merchant chooses their payout currency on **Polygon PoS (Chain ID 137)**:
- **USDC**: `0x3c499c542cef5e3811e1192ce70d8cc03d5c3359` (Asset ID: `nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L`)
- **USDT**: `0xc2132d05d31c914a87c6611c10748aeb04b58e8f` (Asset ID: `nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr`)

All settled funds are transferred directly into the merchant's Polygon EVM address (`0x...`).

### 3. Payer Pays With Any Token on Any Supported Chain
Through Aurora Intents, payers can pay using **216+ tokens** across **38+ supported blockchains**, including:
- **Solana** (`sol`): SOL, USDC, USDT
- **Bitcoin** (`btc`): BTC
- **Ethereum** (`eth`): ETH, WBTC, DAI, PEPE, SHIB
- **Base** (`base`): ETH, USDbC, AERO
- **Arbitrum** (`arb`): ETH, ARB
- **BNB Chain** (`bsc`): BNB, CAKE
- **TRON** (`tron`): TRX, USDT
- **NEAR** (`near`): NEAR, wNEAR
- **Sui** (`sui`): SUI
- **Dogecoin** (`doge`): DOGE
- **Litecoin** (`ltc`): LTC
- **Cardano** (`cardano`): ADA
- **Stellar** (`stellar`): XLM
- **Avalanche** (`avax`): AVAX
- **Optimism** (`op`): ETH, OP

### 4. Aurora Intents Exact Output Quote Flow
1. DashPay requests an `EXACT_OUTPUT` quote targeting the exact Polygon stablecoin amount.
2. Aurora Intents solvers return a cryptographic quote with a unique, one-time `depositAddress` on the payer's origin chain.
3. The payer scans the QR code or copies the deposit address in their native wallet.
4. When the deposit arrives on the source chain, solvers execute the swap and deliver stablecoins directly to the merchant's Polygon address.
5. If the deposit is incomplete or the quote expires, Aurora Intents automatically refunds the funds to the payer's refund address.

### 5. Real-Time Status Tracking
The frontend monitors the swap lifecycle via the Aurora Intents status endpoint:
- `PENDING_DEPOSIT`: Waiting for payer transfer
- `KNOWN_DEPOSIT_TX`: Deposit detected in mempool
- `PROCESSING`: Aurora Intents solver executing cross-chain intent
- `SUCCESS`: Stablecoins deposited in merchant's Polygon wallet (with Polygonscan link)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+ (tested on v23.4.0)
- npm v10+

### Installation
```bash
git clone <repo-url>
cd dashpay
npm install
```

### Run Server & Frontend

#### Production Mode (Runs unified on port 3001)
```bash
npm run build
npm run server
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

#### Development Mode (Concurrent with Vite Hot Reload)
```bash
npm run dev
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Gateway health check and supported currency list |
| `GET` | `/api/fx/rates` | Real-time FX exchange rates for CRC, SVC, GMD, EUR |
| `POST` | `/api/fx/convert` | Convert amount in Colones, Dalasi or Euros to Polygon stablecoin units |
| `GET` | `/api/invoices` | List all merchant invoices |
| `POST` | `/api/invoices` | Create a new merchant invoice |
| `GET` | `/api/tokens` | Get 216+ supported tokens and 38+ blockchains from Aurora Intents |
| `POST` | `/api/quote/for-invoice` | Request an EXACT_OUTPUT quote for an invoice |
| `GET` | `/api/status` | Query swap execution status by `depositAddress` |
| `POST` | `/api/simulate/advance` | Demo Sandbox: Advance simulation to test UI completion |

---

## 🛡️ License
MIT License.

