const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis');
const config = require('../config');

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${options.prefix || 'general'}:`,
    }),
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
  });
};

const generalLimiter = createRateLimiter({
  ...config.rateLimit.general,
  prefix: 'general',
});

const urlCreationLimiter = createRateLimiter({
  ...config.rateLimit.urlCreation,
  prefix: 'url-create',
});

const redirectLimiter = createRateLimiter({
  ...config.rateLimit.redirect,
  prefix: 'redirect',
});

module.exports = { generalLimiter, urlCreationLimiter, redirectLimiter };
