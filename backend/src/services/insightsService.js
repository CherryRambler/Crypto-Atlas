const axios = require('axios');
const { insightsCache, getOrSet } = require('../utils/cache');
const logger = require('../utils/logger');

const GROQ_API = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Build a structured prompt for market analysis
 */
function buildPrompt(coin, beginnerMode = false) {
  const { name, symbol, marketData, history } = coin;
  const md = marketData;

  // Compute recent trend from last 7 days of prices
  const prices = history?.prices || [];
  const recentPrices = prices.slice(-7).map(p => p.price);
  const trendStr = recentPrices.length > 1
    ? recentPrices.map((p, i) => `Day ${i + 1}: $${p?.toFixed(2)}`).join(', ')
    : 'Not available';

  const audienceNote = beginnerMode
    ? 'Explain in simple, beginner-friendly language. Avoid jargon. Use analogies where helpful.'
    : 'Use precise financial and technical language appropriate for experienced crypto traders.';

  return `You are CryptoAtlas AI, a cryptocurrency market analyst. ${audienceNote}

Analyze the following live market data for ${name} (${symbol}) and provide structured insights:

MARKET SNAPSHOT:
- Current Price: $${md.price?.toFixed(4) ?? 'N/A'}
- 24h Change: ${md.priceChangePercent24h?.toFixed(2) ?? 'N/A'}%
- 7d Change: ${md.priceChangePercent7d?.toFixed(2) ?? 'N/A'}%
- 30d Change: ${md.priceChangePercent30d?.toFixed(2) ?? 'N/A'}%
- Market Cap: $${md.marketCap ? (md.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
- 24h Volume: $${md.volume24h ? (md.volume24h / 1e9).toFixed(2) + 'B' : 'N/A'}
- 24h High/Low: $${md.high24h?.toFixed(2) ?? 'N/A'} / $${md.low24h?.toFixed(2) ?? 'N/A'}
- All-Time High: $${md.ath?.toFixed(4) ?? 'N/A'} (${md.athChangePercent?.toFixed(1) ?? 'N/A'}% from ATH)
- Circulating Supply: ${md.circulatingSupply ? (md.circulatingSupply / 1e6).toFixed(2) + 'M' : 'N/A'}
- Market Cap Rank: #${md.marketCapRank ?? 'N/A'}

7-DAY PRICE TREND:
${trendStr}

Respond ONLY with a JSON object in this exact structure (no markdown, no extra text):
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "sentimentScore": <number from -100 to 100>,
  "summary": "<2-3 sentence overview of current market status>",
  "priceMovementExplanation": "<explanation of recent price action based on the data>",
  "keyMetrics": ["<insight about metric 1>", "<insight about metric 2>", "<insight about metric 3>"],
  "trend": "<short-term trend description>",
  "riskLevel": "low" | "medium" | "high" | "very_high",
  "watchPoints": ["<thing to watch 1>", "<thing to watch 2>"],
  "disclaimer": "This analysis is for informational purposes only and does not constitute financial advice."
}`;
}

/**
 * Call Groq API with the given prompt
 */
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await axios.post(
    GROQ_API,
    {
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are CryptoAtlas AI. Return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const text = response.data.choices?.[0]?.message?.content || '';
  return text;
}

/**
 * Parse and validate AI response JSON
 */
function parseInsights(rawText, coinId) {
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const required = ['sentiment', 'summary', 'priceMovementExplanation', 'keyMetrics'];
    for (const field of required) {
      if (!parsed[field]) throw new Error(`Missing field: ${field}`);
    }

    return {
      ...parsed,
      coinId,
      generatedAt: new Date().toISOString(),
      source: 'CryptoAtlas AI',
    };
  } catch (err) {
    logger.warn('Failed to parse AI response as JSON', { error: err.message });
    // Graceful fallback: return structured error response
    return {
      coinId,
      sentiment: 'neutral',
      sentimentScore: 0,
      summary: 'AI analysis temporarily unavailable. Please try again shortly.',
      priceMovementExplanation: 'Unable to generate analysis at this time.',
      keyMetrics: [],
      trend: 'Data unavailable',
      riskLevel: 'medium',
      watchPoints: [],
      disclaimer: 'This analysis is for informational purposes only.',
      generatedAt: new Date().toISOString(),
      source: 'CryptoAtlas AI',
      error: true,
    };
  }
}

/**
 * GET /api/insights/:id
 * Generate AI-driven insights for a coin
 */
async function getCoinInsights(coin, { beginnerMode = false } = {}) {
  const modeKey = beginnerMode ? 'beginner' : 'expert';
  const cacheKey = `insights_${coin.id}_${modeKey}`;

  const { data, fromCache } = await getOrSet(insightsCache, cacheKey, async () => {
    logger.info('Generating AI insights', { coinId: coin.id, beginnerMode });

    const prompt = buildPrompt(coin, beginnerMode);

    try {
      const rawText = await callGroq(prompt);
      return parseInsights(rawText, coin.id);
    } catch (err) {
      logger.error('AI insights generation failed', { coinId: coin.id, message: err.message });
      // Return graceful fallback instead of crashing
      return parseInsights('', coin.id);
    }
  });

  logger.debug(fromCache ? `Served insights for ${coin.id} from cache` : `Generated fresh insights for ${coin.id}`);
  return data;
}

module.exports = { getCoinInsights };
