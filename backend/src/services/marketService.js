const axios = require('axios');
const { marketCache, coinCache, getOrSet } = require('../utils/cache');
const logger = require('../utils/logger');

const CRYPTOCOMPARE_BASE = process.env.CRYPTOCOMPARE_API_BASE || 'https://min-api.cryptocompare.com/data';
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const DEFAULT_TSYM = 'USD';
const RATE_LIMIT_MS = 1200;

const COIN_MAPPINGS = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
  ethereum: { symbol: 'ETH', name: 'Ethereum' },
  tether: { symbol: 'USDT', name: 'Tether' },
  binancecoin: { symbol: 'BNB', name: 'BNB' },
  solana: { symbol: 'SOL', name: 'Solana' },
  xrp: { symbol: 'XRP', name: 'XRP' },
  cardano: { symbol: 'ADA', name: 'Cardano' },
  dogecoin: { symbol: 'DOGE', name: 'Dogecoin' },
  tron: { symbol: 'TRX', name: 'TRON' },
  chainlink: { symbol: 'LINK', name: 'Chainlink' },
  avalanche: { symbol: 'AVAX', name: 'Avalanche' },
  'avalanche-2': { symbol: 'AVAX', name: 'Avalanche' },
  sui: { symbol: 'SUI', name: 'Sui' },
  stellar: { symbol: 'XLM', name: 'Stellar' },
  toncoin: { symbol: 'TON', name: 'Toncoin' },
  shiba: { symbol: 'SHIB', name: 'Shiba Inu' },
  'shiba-inu': { symbol: 'SHIB', name: 'Shiba Inu' },
  hedera: { symbol: 'HBAR', name: 'Hedera' },
  litecoin: { symbol: 'LTC', name: 'Litecoin' },
  polkadot: { symbol: 'DOT', name: 'Polkadot' },
  bitcoincash: { symbol: 'BCH', name: 'Bitcoin Cash' },
  'bitcoin-cash': { symbol: 'BCH', name: 'Bitcoin Cash' },
  uniswap: { symbol: 'UNI', name: 'Uniswap' },
  pepecoin: { symbol: 'PEPE', name: 'Pepe' },
  pepe: { symbol: 'PEPE', name: 'Pepe' },
  aptos: { symbol: 'APT', name: 'Aptos' },
  near: { symbol: 'NEAR', name: 'NEAR Protocol' },
  'near-protocol': { symbol: 'NEAR', name: 'NEAR Protocol' },
  internetcomputer: { symbol: 'ICP', name: 'Internet Computer' },
  'internet-computer': { symbol: 'ICP', name: 'Internet Computer' },
  ethereumclassic: { symbol: 'ETC', name: 'Ethereum Classic' },
  'ethereum-classic': { symbol: 'ETC', name: 'Ethereum Classic' },
  cosmos: { symbol: 'ATOM', name: 'Cosmos' },
  filecoin: { symbol: 'FIL', name: 'Filecoin' },
  arbitrum: { symbol: 'ARB', name: 'Arbitrum' },
  optimism: { symbol: 'OP', name: 'Optimism' },
  aave: { symbol: 'AAVE', name: 'Aave' },
  monero: { symbol: 'XMR', name: 'Monero' },
  vechain: { symbol: 'VET', name: 'VeChain' },
};

const SYMBOL_TO_ID = Object.entries(COIN_MAPPINGS).reduce((acc, [id, coin]) => {
  if (!acc[coin.symbol]) {
    acc[coin.symbol] = id;
  }
  return acc;
}, {});

let lastCallAt = 0;

function buildHeaders() {
  return CRYPTOCOMPARE_API_KEY
    ? { authorization: `Apikey ${CRYPTOCOMPARE_API_KEY}` }
    : {};
}

async function throttledGet(path, params = {}) {
  const now = Date.now();
  const elapsed = now - lastCallAt;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }

  lastCallAt = Date.now();

  try {
    return await axios.get(`${CRYPTOCOMPARE_BASE}${path}`, {
      params,
      headers: buildHeaders(),
      timeout: 15000,
    });
  } catch (err) {
    const message = err.response?.data?.Message || err.message;
    const wrapped = new Error(message);
    wrapped.statusCode = err.response?.status || 502;
    wrapped.details = err.response?.data;
    throw wrapped;
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCurrency(currency = 'usd') {
  return String(currency || DEFAULT_TSYM).trim().toUpperCase();
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function ensureNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function resolveCoinMapping(input) {
  const raw = String(input || '').trim();
  const normalized = raw.toLowerCase();
  const slug = slugify(raw);
  const mapped = COIN_MAPPINGS[normalized] || COIN_MAPPINGS[slug];

  if (mapped) {
    return {
      id: slug || normalized,
      symbol: mapped.symbol,
      name: mapped.name,
    };
  }

  const symbol = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return {
    id: slug || normalized,
    symbol,
    name: raw,
  };
}

function buildImageUrl(imagePath) {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `https://www.cryptocompare.com${imagePath}`;
}

function extractPricePayload(response, symbol, currency) {
  return response?.RAW?.[symbol]?.[currency] || {};
}

function normalizeTopCoin(entry, currency) {
  const info = entry?.CoinInfo || {};
  const raw = entry?.RAW?.[currency] || {};
  const symbol = info.Name || null;
  const id = SYMBOL_TO_ID[symbol] || slugify(info.FullName || info.Name);

  return {
    id: id || slugify(info.Name),
    symbol,
    name: info.FullName || info.Name || null,
    image: buildImageUrl(info.ImageUrl),
    price: ensureNumber(raw.PRICE),
    marketCap: ensureNumber(raw.MKTCAP),
    marketCapRank: ensureNumber(raw.TOPTIERMKTCCAPUSDRANK),
    volume24h: ensureNumber(firstDefined(raw.TOTALVOLUME24HTO, raw.VOLUME24HTO)),
    change1h: ensureNumber(raw.CHANGEPCTHOUR),
    change24h: ensureNumber(raw.CHANGEPCT24HOUR),
    change7d: null,
    high24h: ensureNumber(raw.HIGH24HOUR),
    low24h: ensureNumber(raw.LOW24HOUR),
    circulatingSupply: ensureNumber(firstDefined(raw.CIRCULATINGSUPPLY, raw.SUPPLY)),
    totalSupply: ensureNumber(raw.SUPPLY),
    maxSupply: ensureNumber(info.MaxSupply),
    ath: null,
    athChangePercent: null,
    lastUpdated: raw.LASTUPDATE ? new Date(raw.LASTUPDATE * 1000).toISOString() : new Date().toISOString(),
  };
}

function normalizeHistoryRows(rows = []) {
  return rows
    .filter((row) => row && row.time)
    .map((row) => ({
      timestamp: new Date(row.time * 1000).toISOString(),
      price: ensureNumber(row.close),
      marketCap: null,
      volume: ensureNumber(row.volumeto),
    }));
}

function buildCoinDetail(mapping, priceRaw, historyRows, meta = {}) {
  const history = normalizeHistoryRows(historyRows);
  const currentSupply = ensureNumber(firstDefined(priceRaw.CIRCULATINGSUPPLY, priceRaw.SUPPLY));
  const priceSeries = history.map((row) => ({ timestamp: row.timestamp, price: row.price }));
  const volumeSeries = history.map((row) => ({ timestamp: row.timestamp, volume: row.volume }));
  const marketCapSeries = history.map((row) => ({
    timestamp: row.timestamp,
    marketCap: row.price != null && currentSupply != null ? row.price * currentSupply : null,
  }));

  return {
    id: mapping.id,
    symbol: mapping.symbol,
    name: meta.fullName || mapping.name || mapping.symbol,
    description: meta.description || null,
    image: meta.image || null,
    links: {
      homepage: meta.homepage || null,
      twitter: meta.twitter || null,
      reddit: meta.reddit || null,
    },
    genesisDate: meta.genesisDate || null,
    marketData: {
      price: ensureNumber(priceRaw.PRICE),
      marketCap: ensureNumber(priceRaw.MKTCAP),
      marketCapRank: ensureNumber(priceRaw.TOPTIERMKTCCAPUSDRANK),
      fullyDilutedValuation: null,
      volume24h: ensureNumber(firstDefined(priceRaw.TOTALVOLUME24HTO, priceRaw.VOLUME24HTO)),
      high24h: ensureNumber(priceRaw.HIGH24HOUR),
      low24h: ensureNumber(priceRaw.LOW24HOUR),
      priceChange24h: ensureNumber(priceRaw.CHANGE24HOUR),
      priceChangePercent24h: ensureNumber(priceRaw.CHANGEPCT24HOUR),
      priceChangePercent7d: null,
      priceChangePercent30d: null,
      priceChangePercent1y: null,
      circulatingSupply: ensureNumber(firstDefined(priceRaw.CIRCULATINGSUPPLY, priceRaw.SUPPLY)),
      totalSupply: ensureNumber(priceRaw.SUPPLY),
      maxSupply: ensureNumber(meta.maxSupply),
      ath: null,
      athChangePercent: null,
      athDate: null,
      atl: null,
      atlChangePercent: null,
    },
    history: {
      prices: priceSeries,
      marketCaps: marketCapSeries,
      volumes: volumeSeries,
    },
    lastUpdated: priceRaw.LASTUPDATE ? new Date(priceRaw.LASTUPDATE * 1000).toISOString() : new Date().toISOString(),
  };
}

async function getTopCoins({ limit = 50, currency = 'usd', page = 1 } = {}) {
  const cacheKey = `market_${currency}_${limit}_${page}`;
  const tsym = normalizeCurrency(currency);

  const { data, fromCache } = await getOrSet(marketCache, cacheKey, async () => {
    logger.info('Fetching market data from CryptoCompare', { limit, currency: tsym, page });

    const res = await throttledGet('/top/mktcapfull', {
      limit: Math.min(limit, 100),
      tsym,
      page: Math.max(page - 1, 0),
    });

    const rows = Array.isArray(res.data?.Data) ? res.data.Data : [];
    return rows.map((entry) => normalizeTopCoin(entry, tsym));
  });

  logger.debug(fromCache ? 'Served market data from cache' : 'Fetched fresh market data');
  return data;
}

async function getCoinMeta(symbol, currency) {
  try {
    const res = await throttledGet('/coin/generalinfo', {
      fsyms: symbol,
      tsym: currency,
    });

    const item = Array.isArray(res.data?.Data) ? res.data.Data[0] : null;
    if (!item) return {};

    const info = item.CoinInfo || {};
    return {
      fullName: info.FullName || info.Name || symbol,
      image: buildImageUrl(info.ImageUrl),
      homepage: null,
      twitter: null,
      reddit: null,
      description: null,
      genesisDate: info.AssetLaunchDate || null,
      maxSupply: info.MaxSupply || null,
    };
  } catch (err) {
    logger.warn('CryptoCompare general info lookup failed', { symbol, message: err.message });
    return {};
  }
}

async function getCoinDetail(coinId, currency = 'usd') {
  const cacheKey = `coin_${coinId}_${currency}`;
  const tsym = normalizeCurrency(currency);
  const mapping = resolveCoinMapping(coinId);

  const { data, fromCache } = await getOrSet(coinCache, cacheKey, async () => {
    logger.info('Fetching coin detail from CryptoCompare', { coinId, symbol: mapping.symbol, currency: tsym });

    const [priceRes, historyRes, meta] = await Promise.all([
      throttledGet('/pricemultifull', {
        fsyms: mapping.symbol,
        tsyms: tsym,
      }),
      throttledGet('/v2/histoday', {
        fsym: mapping.symbol,
        tsym: tsym,
        limit: 30,
      }),
      getCoinMeta(mapping.symbol, tsym),
    ]);

    const priceRaw = extractPricePayload(priceRes.data, mapping.symbol, tsym);
    const historyRows = historyRes.data?.Data?.Data;

    if (!priceRaw.PRICE) {
      const err = new Error(`Coin ${coinId} not found in CryptoCompare`);
      err.statusCode = 404;
      throw err;
    }

    return buildCoinDetail(mapping, priceRaw, Array.isArray(historyRows) ? historyRows : [], meta);
  });

  logger.debug(fromCache ? `Served ${coinId} from cache` : `Fetched fresh data for ${coinId}`);
  return data;
}

async function getGlobalStats(currency = 'usd') {
  const tsym = normalizeCurrency(currency);
  const cacheKey = `global_stats_${tsym}`;

  const { data } = await getOrSet(marketCache, cacheKey, async () => {
    const topCoins = await getTopCoins({ limit: 50, currency: tsym.toLowerCase(), page: 1 });
    const totalMarketCap = topCoins.reduce((sum, coin) => sum + (coin.marketCap || 0), 0);
    const totalVolume24h = topCoins.reduce((sum, coin) => sum + (coin.volume24h || 0), 0);
    const btc = topCoins.find((coin) => coin.symbol === 'BTC');
    const eth = topCoins.find((coin) => coin.symbol === 'ETH');

    return {
      totalMarketCap: totalMarketCap || null,
      totalVolume24h: totalVolume24h || null,
      btcDominance: totalMarketCap && btc?.marketCap ? (btc.marketCap / totalMarketCap) * 100 : null,
      ethDominance: totalMarketCap && eth?.marketCap ? (eth.marketCap / totalMarketCap) * 100 : null,
      activeCurrencies: topCoins.length || null,
      marketCapChangePercent24h: null,
      updatedAt: new Date().toISOString(),
      sourceNote: 'Derived from the top 50 CryptoCompare market-cap assets.',
    };
  });

  return data;
}

module.exports = { getTopCoins, getCoinDetail, getGlobalStats, resolveCoinMapping };
