const redis = require('../config/redis');

const CACHE_PREFIX = 'url:';
const DEFAULT_TTL = 3600; // 1 hour

const cacheService = {
  async getUrl(shortCode) {
    const cached = await redis.get(`${CACHE_PREFIX}${shortCode}`);
    return cached ? JSON.parse(cached) : null;
  },

  async setUrl(shortCode, data, ttl = DEFAULT_TTL) {
    await redis.set(
      `${CACHE_PREFIX}${shortCode}`,
      JSON.stringify(data),
      'EX',
      ttl
    );
  },

  async deleteUrl(shortCode) {
    await redis.del(`${CACHE_PREFIX}${shortCode}`);
  },

  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key, value, ttl = DEFAULT_TTL) {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  },

  async del(key) {
    await redis.del(key);
  },

  async incrementClickCount(shortCode) {
    await redis.incr(`clicks:${shortCode}`);
  },
};

module.exports = cacheService;
