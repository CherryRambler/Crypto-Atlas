# 🌐 CryptoAtlas: Real-Time Crypto Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)

**CryptoAtlas** is a professional-grade cryptocurrency monitoring dashboard. Built with a focus on accuracy and speed, it bridges the gap between raw market data and actionable intelligence by combining high-fidelity charts, news aggregation, and automated price alerts.

---

## ⚡ Live Demo

- **Frontend:** [https://crypto-atlas.vercel.app/](https://crypto-atlas.vercel.app/)
- **Backend API:** [https://crypto-atlas.onrender.com](https://crypto-atlas.onrender.com)

---

## ✨ Features

- **🚀 Hybrid Market Data:** Real-time stats from **CoinMarketCap** paired with high-resolution historical OHLCV data from **Binance**.
- **📈 Professional Charting:** Interactive price charts with multiple timeframes (24H, 7D, 30D, 90D).
- **🔔 Synchronized Alerts:** Create and manage price/percentage alerts that are persisted on the backend for reliable monitoring.
- **🧠 AI-Powered Insights:** Rule-based AI analysis providing momentum indicators, risk assessment, and trend summaries for every asset.
- **🌍 Global Metrics at a Glance:** Overarching market health tracking including Total Market Cap, 24h Volume, and Bitcoin dominance.
- **📰 News Aggregator:** Multi-source crypto news feed (NewsAPI, CryptoCompare, RSS) with smart tagging and sentiment context.
- **💎 Premium UI/UX:** A stunning, responsive interface built with Tailwind CSS, featuring glassmorphism elements and smooth micro-animations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Zustand (State), Recharts, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, Axios, RSS Parser, Node-Cache |
| **Data Providers** | CoinMarketCap (Market), Binance (Charts), NewsAPI / CryptoCompare (News) |
| **Security** | Helmet, Express Rate Limit, CORS configuration |

---

## ⚙️ Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [CoinMarketCap API Key](https://pro.coinmarketcap.com/) (Free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saxen/CryptoAtlas.git
   cd CryptoAtlas
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Add your API keys here
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the app:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```text
CryptoAtlas/
├── backend/            # Express.js Server
│   ├── src/           # Controllers, Services, & Routes
│   ├── cache/         # Memory caching layer
│   └── .env.example   # Template for environment variables
├── frontend/           # React + Vite Application
│   ├── src/styles/    # Design system and tokens
│   ├── src/store/     # Zustand state management
│   ├── src/services/  # API integration & normalization
│   └── src/pages/     # Main dashboard and detail views
└── README.md           # You are here!
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ for the Crypto Community.
