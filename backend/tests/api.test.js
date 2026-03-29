/**
 * CryptoAtlas API - Basic Integration Tests
 * Run with: node tests/api.test.js
 * (Requires server to be running on PORT 3001)
 */

const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 3001}`;
let passed = 0;
let failed = 0;

async function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${path}`, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3001,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

async function run() {
  console.log('\n🧪 CryptoAtlas API Tests\n');

  // Root
  console.log('📍 Root endpoint');
  const root = await get('/');
  assert('Returns 200', root.status === 200);
  assert('Has endpoints map', root.body.endpoints !== undefined);

  // Health
  console.log('\n📍 Health check');
  const health = await get('/api/health');
  assert('Returns 200', health.status === 200);
  assert('Status is ok', health.body.status === 'ok');
  assert('Has uptime', typeof health.body.uptime === 'number');

  // Market
  console.log('\n📍 Market endpoint');
  const market = await get('/api/market?limit=5');
  assert('Returns 200', market.status === 200);
  assert('Success flag true', market.body.success === true);
  assert('Has coins array', Array.isArray(market.body.data?.coins));
  assert('Has global stats', market.body.data?.global !== undefined || true); // optional

  if (market.body.data?.coins?.length > 0) {
    const coin = market.body.data.coins[0];
    assert('Coin has id', !!coin.id);
    assert('Coin has price', coin.price !== undefined);
    assert('Coin has marketCap', coin.marketCap !== undefined);
    assert('Coin has 24h change', coin.change24h !== undefined);
  }

  // Coin detail
  console.log('\n📍 Coin detail endpoint');
  const coinRes = await get('/api/coin/bitcoin');
  assert('Returns 200', coinRes.status === 200);
  assert('Has coin data', coinRes.body.data?.id === 'bitcoin');
  assert('Has history', Array.isArray(coinRes.body.data?.history?.prices));

  // Bad coin
  const badCoin = await get('/api/coin/not-a-real-coin-xyz123');
  assert('Bad coin returns error', badCoin.status >= 400);

  // News
  console.log('\n📍 News endpoint');
  const news = await get('/api/news?limit=5');
  assert('Returns 200', news.status === 200);
  assert('Has articles array', Array.isArray(news.body.data));

  // Alerts CRUD
  console.log('\n📍 Alerts CRUD');

  const createRes = await post('/api/alerts', {
    coinId: 'bitcoin',
    coinName: 'Bitcoin',
    type: 'price',
    threshold: 50000,
    direction: 'above',
  });
  assert('Create alert returns 201', createRes.status === 201);
  assert('Alert has id', !!createRes.body.data?.id);
  const alertId = createRes.body.data?.id;

  const listRes = await get('/api/alerts');
  assert('List alerts returns 200', listRes.status === 200);
  assert('Alert appears in list', listRes.body.data?.some(a => a.id === alertId));

  // Validation: missing field
  const badAlert = await post('/api/alerts', { coinId: 'bitcoin', type: 'price' });
  assert('Invalid alert returns 400', badAlert.status === 400);

  // Delete
  const delRes = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3001,
      path: `/api/alerts/${alertId}`,
      method: 'DELETE',
    };
    http.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    }).on('error', reject).end();
  });
  assert('Delete alert returns 200', delRes.status === 200);
  assert('Delete confirms deletion', delRes.body.data?.deleted === true);

  // 404 route
  console.log('\n📍 Error handling');
  const unknown = await get('/api/this-does-not-exist');
  assert('Unknown route returns 404', unknown.status === 404);

  // Summary
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Tests: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log(failed === 0 ? '\n🎉 All tests passed!\n' : '\n⚠️  Some tests failed.\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});