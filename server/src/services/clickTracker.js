const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const prisma = require('../config/database');

const BATCH_SIZE = 100;
const FLUSH_INTERVAL = 5000; // 5 seconds

class ClickTracker {
  constructor() {
    this.buffer = [];
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL);
  }

  track(urlId, req) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || '0.0.0.0';

    const ua = new UAParser(req.headers['user-agent']);
    const geo = geoip.lookup(ip);

    const clickData = {
      urlId,
      ip: this.anonymizeIp(ip),
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      device: ua.getDevice().type || 'desktop',
      browser: ua.getBrowser().name || 'Unknown',
      os: ua.getOS().name || 'Unknown',
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
    };

    this.buffer.push(clickData);

    if (this.buffer.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  anonymizeIp(ip) {
    if (ip.includes('.')) {
      return ip.split('.').slice(0, 3).join('.') + '.0';
    }
    return ip;
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const clicks = [...this.buffer];
    this.buffer = [];

    try {
      await prisma.click.createMany({ data: clicks });
    } catch (err) {
      console.error('Failed to flush clicks:', err.message);
      // Re-add failed clicks to buffer (max retry once)
      if (clicks.length <= BATCH_SIZE) {
        this.buffer.unshift(...clicks);
      }
    }
  }

  async shutdown() {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}

module.exports = new ClickTracker();
