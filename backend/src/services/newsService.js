const Parser = require('rss-parser');
const axios = require('axios');
const { newsCache, getOrSet } = require('../utils/cache');
const logger = require('../utils/logger');

const rssParser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'CryptoAtlas/1.0 News Aggregator' },
  customFields: {
    item: ['media:thumbnail', 'media:content', 'enclosure'],
  },
});

// Diverse mix of crypto news RSS sources
const NEWS_FEEDS = [
  {
    url: 'https://cointelegraph.com/rss',
    source: 'CoinTelegraph',
    category: 'general',
  },
  {
    url: 'https://coindesk.com/arc/outboundfeeds/rss/',
    source: 'CoinDesk',
    category: 'general',
  },
  {
    url: 'https://cryptopotato.com/feed/',
    source: 'CryptoPotato',
    category: 'analysis',
  },
  {
    url: 'https://bitcoinmagazine.com/.rss/full/',
    source: 'Bitcoin Magazine',
    category: 'bitcoin',
  },
  {
    url: 'https://decrypt.co/feed',
    source: 'Decrypt',
    category: 'general',
  },
];

/**
 * Normalize a raw RSS item into a clean article shape
 */
function normalizeArticle(item, sourceName, category) {
  // Extract image from various RSS fields
  const image =
    item['media:thumbnail']?.['$']?.url ||
    item['media:content']?.['$']?.url ||
    item.enclosure?.url ||
    null;

  // Clean and truncate summary
  const rawSummary = item.contentSnippet || item.summary || item.content || '';
  const summary = rawSummary
    .replace(/<[^>]+>/g, '')   // strip HTML
    .replace(/\s+/g, ' ')      // collapse whitespace
    .trim()
    .slice(0, 300);

  return {
    id: Buffer.from(item.link || item.guid || item.title || '').toString('base64').slice(0, 16),
    title: (item.title || 'Untitled').trim(),
    source: sourceName,
    category,
    url: item.link || item.guid || null,
    summary: summary || null,
    image,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    author: item.creator || item.author || null,
  };
}

/**
 * Fetch a single RSS feed with error tolerance
 */
async function fetchFeed({ url, source, category }) {
  try {
    const feed = await rssParser.parseURL(url);
    return (feed.items || []).slice(0, 10).map(item =>
      normalizeArticle(item, source, category)
    );
  } catch (err) {
    logger.warn(`Failed to fetch feed: ${source}`, { url, error: err.message });
    return []; // graceful degradation — don't fail whole request
  }
}

/**
 * GET /api/news
 * Returns aggregated, deduplicated crypto news
 */
async function getLatestNews({ limit = 30, category = null } = {}) {
  const cacheKey = `news_${category || 'all'}_${limit}`;

  const { data, fromCache } = await getOrSet(newsCache, cacheKey, async () => {
    logger.info('Fetching crypto news from RSS feeds');

    // Fetch all feeds in parallel
    const results = await Promise.all(NEWS_FEEDS.map(fetchFeed));

    // Flatten and deduplicate by title similarity
    const allArticles = results.flat();
    const seen = new Set();
    const unique = allArticles.filter(article => {
      // Deduplicate by normalized title
      const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by recency
    unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return unique;
  });

  logger.debug(fromCache ? 'Served news from cache' : 'Fetched fresh news');

  // Apply filters post-cache
  let filtered = data;
  if (category) {
    filtered = data.filter(a => a.category === category);
  }

  return filtered.slice(0, limit);
}

module.exports = { getLatestNews };