import axios from 'axios'
import Parser from 'rss-parser'
import { cache } from '../cache/index.js'
import config from '../config/index.js'

const parser = new Parser()

/**
 * Fetches and aggregates crypto news from multiple sources.
 * Sources: NewsAPI.org, CryptoCompare, and CoinDesk RSS fallback.
 *
 * @returns {Promise<Array>}
 */
export async function getNews() {
  const CACHE_KEY = 'news-v4'

  const cached = cache.get(CACHE_KEY)
  if (cached) return cached

  try {
    const newsSources = []

    // 1. Try NewsAPI.org (Global mainstream finance/tech news)
    if (config.newsapi.apiKey) {
      try {
        const { data: newsApiData } = await axios.get(`${config.newsapi.baseUrl}/everything`, {
          params: {
            q: 'cryptocurrency OR bitcoin OR ethereum',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 20,
            apiKey: config.newsapi.apiKey,
          },
        })
        const mapped = newsApiData.articles.map((item, idx) => ({
          id: `newsapi-${idx}-${item.publishedAt}`,
          title: item.title,
          url: item.url,
          source: item.source.name,
          publishedAt: item.publishedAt,
          image: item.urlToImage,
          body: item.description,
          tags: ['market', 'global'],
        }))
        newsSources.push(...mapped)
      } catch (err) {
        console.warn('NewsAPI.org fetch failed:', err.message)
      }
    }

    // 2. Try CryptoCompare (Crypto-specific aggregate)
    if (config.cryptocompare.apiKey) {
      try {
        const { data: ccData } = await axios.get(config.cryptocompare.newsUrl, {
          params: { api_key: config.cryptocompare.apiKey },
        })
        const mapped = ccData.Data.map((item) => ({
          id: `cc-${item.id}`,
          title: item.title,
          url: item.url,
          source: item.source_info.name,
          publishedAt: new Date(item.published_on * 1000).toISOString(),
          image: item.imageurl,
          body: item.body,
          tags: item.categories.split('|').slice(0, 3),
        }))
        newsSources.push(...mapped)
      } catch (err) {
        console.warn('CryptoCompare fetch failed:', err.message)
      }
    }

    // 3. Fallback to RSS if we have nothing or very little
    if (newsSources.length < 5) {
      try {
        const feed = await parser.parseURL('https://www.coindesk.com/arc/outboundfeed/rss/')
        const mapped = feed.items.map((item) => ({
          id: item.guid || item.link,
          title: item.title,
          url: item.link,
          source: 'CoinDesk',
          publishedAt: item.isoDate,
          image: item.enclosure?.url || '',
          body: item.contentSnippet,
          tags: ['RSS', 'CoinDesk'],
        }))
        newsSources.push(...mapped)
      } catch (err) {
        console.warn('RSS fallback failed:', err.message)
      }
    }

    // Sort by date (newest first)
    const sortedNews = newsSources.sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    )

    cache.set(CACHE_KEY, sortedNews, config.cache.news)
    return sortedNews
  } catch (error) {
    console.error('Core news service error:', error)
    return []
  }
}
