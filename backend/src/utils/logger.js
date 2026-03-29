const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function timestamp() {
  return new Date().toISOString();
}

function log(level, message, meta = null) {
  if (LOG_LEVELS[level] < CURRENT_LEVEL) return;
  const entry = { ts: timestamp(), level: level.toUpperCase(), message };
  if (meta) entry.meta = meta;
  const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level];
  console.log(`${color}[${entry.ts}] [${entry.level}]\x1b[0m ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

module.exports = {
  debug: (msg, meta) => log('debug', msg, meta),
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};