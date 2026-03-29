// ── Realistic mock data for development ──────────
// Replace API calls with these when backend is not available

export const MOCK_COINS = [
  {
    id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'BTC',
    logo: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
    price: 67420.55, change_24h: 2.34, market_cap: 1327000000000,
    volume: 28400000000, circulating_supply: 19700000, ath: 73750,
    trending: false,
  },
  {
    id: 'ethereum', rank: 2, name: 'Ethereum', symbol: 'ETH',
    logo: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
    price: 3512.88, change_24h: -1.12, market_cap: 421000000000,
    volume: 14200000000, circulating_supply: 120200000, ath: 4878,
    trending: true,
  },
  {
    id: 'solana', rank: 3, name: 'Solana', symbol: 'SOL',
    logo: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
    price: 178.42, change_24h: 5.67, market_cap: 83000000000,
    volume: 3900000000, circulating_supply: 465000000, ath: 259.96,
    trending: true,
  },
  {
    id: 'binancecoin', rank: 4, name: 'BNB', symbol: 'BNB',
    logo: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
    price: 592.10, change_24h: 0.88, market_cap: 86000000000,
    volume: 1800000000, circulating_supply: 145000000, ath: 686.31,
    trending: false,
  },
  {
    id: 'xrp', rank: 5, name: 'XRP', symbol: 'XRP',
    logo: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png',
    price: 0.5842, change_24h: -3.21, market_cap: 32000000000,
    volume: 1200000000, circulating_supply: 54800000000, ath: 3.84,
    trending: false,
  },
  {
    id: 'cardano', rank: 6, name: 'Cardano', symbol: 'ADA',
    logo: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png',
    price: 0.4512, change_24h: 1.45, market_cap: 16000000000,
    volume: 420000000, circulating_supply: 35400000000, ath: 3.09,
    trending: false,
  },
  {
    id: 'avalanche-2', rank: 7, name: 'Avalanche', symbol: 'AVAX',
    logo: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png',
    price: 38.72, change_24h: 7.89, market_cap: 16000000000,
    volume: 890000000, circulating_supply: 413000000, ath: 144.96,
    trending: true,
  },
  {
    id: 'polkadot', rank: 8, name: 'Polkadot', symbol: 'DOT',
    logo: 'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png',
    price: 7.24, change_24h: -2.88, market_cap: 10000000000,
    volume: 310000000, circulating_supply: 1380000000, ath: 55.00,
    trending: false,
  },
  {
    id: 'chainlink', rank: 9, name: 'Chainlink', symbol: 'LINK',
    logo: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png',
    price: 14.83, change_24h: 4.12, market_cap: 9000000000,
    volume: 510000000, circulating_supply: 607000000, ath: 52.70,
    trending: false,
  },
  {
    id: 'dogecoin', rank: 10, name: 'Dogecoin', symbol: 'DOGE',
    logo: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png',
    price: 0.1624, change_24h: -0.54, market_cap: 23000000000,
    volume: 1100000000, circulating_supply: 144000000000, ath: 0.731578,
    trending: false,
  },
]

// Generate realistic chart data for a coin
export function generateChartData(timeframe = '24h', basePrice = 67420) {
  const now = Date.now()
  const configs = {
    '24h': { points: 48, interval: 30 * 60 * 1000, volatility: 0.008 },
    '7d':  { points: 84, interval: 2 * 60 * 60 * 1000, volatility: 0.02 },
    '30d': { points: 90, interval: 8 * 60 * 60 * 1000, volatility: 0.04 },
    '1y':  { points: 104, interval: 3.5 * 24 * 60 * 60 * 1000, volatility: 0.08 },
  }
  const { points, interval, volatility } = configs[timeframe]
  const data = []
  let price = basePrice * (1 - volatility * points * 0.5)

  for (let i = points; i >= 0; i--) {
    const change = (Math.random() - 0.48) * volatility
    price = price * (1 + change)
    data.push({
      timestamp: new Date(now - i * interval).toISOString(),
      price: Math.max(price, 0.001),
      volume: Math.random() * 1e9 + 5e8,
    })
  }
  return data
}

export const MOCK_NEWS = [
  {
    id: 1,
    title: 'Bitcoin ETF Sees Record Inflows as Institutional Demand Surges',
    source: 'CoinDesk',
    time: '12 min ago',
    summary: 'Spot Bitcoin ETFs recorded their highest single-day inflows since launch, driven by fresh institutional allocation from major asset managers.',
    url: 'https://coindesk.com',
    tag: 'Bitcoin',
  },
  {
    id: 2,
    title: 'Ethereum Layer-2 Ecosystems Hit $40B TVL Milestone',
    source: 'The Block',
    time: '1 hr ago',
    summary: 'Total value locked across Ethereum scaling solutions has crossed $40 billion, with Arbitrum and Base leading growth in the past quarter.',
    url: 'https://theblock.co',
    tag: 'Ethereum',
  },
  {
    id: 3,
    title: 'Solana DEX Volume Surpasses Ethereum for Third Consecutive Week',
    source: 'Decrypt',
    time: '3 hr ago',
    summary: 'Decentralized exchange activity on Solana continues to outpace Ethereum mainnet in weekly trading volume, fueled by memecoin activity.',
    url: 'https://decrypt.co',
    tag: 'Solana',
  },
  {
    id: 4,
    title: 'Fed Rate Decision Lifts Risk Assets; Crypto Rallies 4%',
    source: 'Bloomberg Crypto',
    time: '5 hr ago',
    summary: 'Crypto markets responded positively to the Federal Reserve\'s decision to hold rates, with the total market cap gaining over $80 billion in 24 hours.',
    url: 'https://bloomberg.com',
    tag: 'Macro',
  },
  {
    id: 5,
    title: 'Avalanche Announces $100M Ecosystem Fund for AI & DePIN Projects',
    source: 'CoinTelegraph',
    time: '8 hr ago',
    summary: 'The Avalanche Foundation has unveiled a new grant program targeting artificial intelligence and decentralized physical infrastructure projects.',
    url: 'https://cointelegraph.com',
    tag: 'Avalanche',
  },
]

export const MOCK_INSIGHTS = {
  bitcoin: {
    movement: 'Bitcoin is rising today primarily due to strong ETF inflows and positive macro sentiment following the Fed\'s decision to hold interest rates steady. Institutional buyers appear to be accumulating at current levels.',
    trend: 'The broader crypto market is in a risk-on phase. Bitcoin dominance sits at 54%, suggesting capital is consolidating in large-cap assets rather than flowing into altcoins.',
    sentiment: 'bullish',
  },
  ethereum: {
    movement: 'ETH is seeing mild selling pressure as traders rotate profits into Solana and smaller L1s. Gas fees remain low due to L2 migration, which reduces immediate demand for ETH.',
    trend: 'Layer-2 adoption is accelerating but hasn\'t yet translated into higher ETH prices. The upcoming EIP proposals around fee burns could be a positive catalyst.',
    sentiment: 'neutral',
  },
  solana: {
    movement: 'SOL is one of today\'s top performers, driven by record DEX volumes and continued memecoin activity on Pump.fun. Ecosystem momentum remains strong.',
    trend: 'Solana is gaining market share from Ethereum in the DeFi and NFT sectors. If current volume trends hold, SOL may challenge its all-time high in the coming weeks.',
    sentiment: 'bullish',
  },
  default: {
    movement: 'This coin is moving with the broader market trend today. No specific catalysts have been identified beyond general market sentiment.',
    trend: 'The overall market is in a consolidation phase after recent gains. Watch for volume breakouts as a signal of the next directional move.',
    sentiment: 'neutral',
  },
}