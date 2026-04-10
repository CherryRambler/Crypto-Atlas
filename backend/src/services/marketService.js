import axios from 'axios'
import { cache } from '../cache/index.js'
import config from '../config/index.js'

const { baseUrl, apiKey } = config.coinmarketcap

/** Build CMC request headers */
function cmcHeaders() {
  return { 'X-CMC_PRO_API_KEY': apiKey }
}

/**
 * Fetches the top 100 cryptocurrencies from CoinMarketCap.
 *
 * @returns {Promise<Array>}
 */
export async function getMarket() {
  const CACHE_KEY = 'market'

  const cached = cache.get(CACHE_KEY)
  if (cached) return cached

  const { data } = await axios.get(`${baseUrl}/cryptocurrency/listings/latest`, {
    headers: cmcHeaders(),
    params: {
      start: 1,
      limit: 100,
      convert: 'USD',
    },
  })

  // Normalize CMC data to our internal format
  const normalised = data.data.map((c) => ({
    id: c.slug, // Use slug as ID for better SEO/routing
    symbol: c.symbol,
    name: c.name,
    image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${c.id}.png`,
    price: c.quote.USD.price,
    change_1h: c.quote.USD.percent_change_1h,
    change_24h: c.quote.USD.percent_change_24h,
    change_7d: c.quote.USD.percent_change_7d,
    market_cap: c.quote.USD.market_cap,
    volume: c.quote.USD.volume_24h,
    circulating_supply: c.circulating_supply,
    rank: c.cmc_rank,
  }))

  cache.set(CACHE_KEY, normalised, config.cache.market)
  return normalised
}

/**
 * Fetches global market data using CMC.
 *
 * @returns {Promise<Object>}
 */
export async function getGlobalStats() {
  const CACHE_KEY = 'global-stats'

  const cached = cache.get(CACHE_KEY)
  if (cached) return cached

  const { data } = await axios.get(`${baseUrl}/global-metrics/quotes/latest`, {
    headers: cmcHeaders(),
  })

  const g = data.data

  const global = {
    total_market_cap: g.quote.USD.total_market_cap,
    total_volume: g.quote.USD.total_volume_24h,
    market_cap_percentage: g.btc_dominance ? { btc: g.btc_dominance, eth: g.eth_dominance } : {},
    market_cap_change_percentage_24h_usd: g.quote.USD.total_market_cap_yesterday_percentage_change,
    active_cryptocurrencies: g.active_cryptocurrencies,
    upcoming_icos: g.upcoming_icos,
    ongoing_icos: g.ongoing_icos,
    ended_icos: g.ended_icos,
    markets: g.active_exchanges,
    updated_at: g.last_updated,
  }

  cache.set(CACHE_KEY, global, config.cache.global)
  return global
}
