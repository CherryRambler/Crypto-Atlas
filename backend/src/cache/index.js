import NodeCache from 'node-cache'
import config from '../config/index.js'

/**
 * Shared in-memory cache instance.
 * TTL values are set per-key using the config object.
 */
const cache = new NodeCache({
  checkperiod: 120, // prune expired keys every 2 minutes
  useClones: false, // avoid deep-clone overhead for large market payloads
})

export { cache, config }
