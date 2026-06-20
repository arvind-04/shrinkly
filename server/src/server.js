const app = require('./app');
const config = require('./config');
const redis = require('./config/redis');
const clickTracker = require('./services/clickTracker');

const startServer = async () => {
  try {
    // Verify Redis connection
    await redis.ping();
    console.log('Redis connection verified');

    const server = app.listen(config.port, () => {
      console.log(`Shrinkly server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Starting graceful shutdown...`);
      await clickTracker.shutdown();
      await redis.quit();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
