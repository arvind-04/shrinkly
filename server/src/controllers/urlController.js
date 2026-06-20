const { nanoid } = require('nanoid');
const prisma = require('../config/database');
const cacheService = require('../services/cacheService');
const clickTracker = require('../services/clickTracker');

exports.createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, title, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required.' });
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    let shortCode = customAlias || nanoid(7);

    if (customAlias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        return res.status(400).json({ error: 'Custom alias can only contain letters, numbers, hyphens, and underscores.' });
      }
      const existing = await prisma.url.findUnique({ where: { shortCode: customAlias } });
      if (existing) {
        return res.status(409).json({ error: 'Custom alias already taken.' });
      }
    }

    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        customAlias,
        title,
        userId: req.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await cacheService.setUrl(shortCode, { originalUrl, id: url.id, isActive: true });

    res.status(201).json({
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      title: url.title,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where: { userId: req.user.id, isActive: true },
        include: { _count: { select: { clicks: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.url.count({ where: { userId: req.user.id, isActive: true } }),
    ]);

    res.json({
      urls: urls.map(url => ({
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
        title: url.title,
        clicks: url._count.clicks,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUrlStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findFirst({
      where: { id, userId: req.user.id },
      include: { _count: { select: { clicks: true } } },
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    const [clicksByDay, topCountries, topDevices, topBrowsers, topReferrers] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM clicks
        WHERE "urlId" = ${id}
        AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.$queryRaw`
        SELECT country, COUNT(*)::int as count
        FROM clicks
        WHERE "urlId" = ${id}
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      `,
      prisma.$queryRaw`
        SELECT device, COUNT(*)::int as count
        FROM clicks
        WHERE "urlId" = ${id}
        GROUP BY device
        ORDER BY count DESC
      `,
      prisma.$queryRaw`
        SELECT browser, COUNT(*)::int as count
        FROM clicks
        WHERE "urlId" = ${id}
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 10
      `,
      prisma.$queryRaw`
        SELECT referrer, COUNT(*)::int as count
        FROM clicks
        WHERE "urlId" = ${id}
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    res.json({
      url: {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        title: url.title,
        totalClicks: url._count.clicks,
        createdAt: url.createdAt,
      },
      analytics: {
        clicksByDay,
        topCountries,
        topDevices,
        topBrowsers,
        topReferrers,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    await prisma.url.update({
      where: { id },
      data: { isActive: false },
    });

    await cacheService.deleteUrl(url.shortCode);

    res.json({ message: 'URL deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Check Redis cache first (sub-5ms)
    let urlData = await cacheService.getUrl(shortCode);

    if (!urlData) {
      // Cache miss — query database
      const url = await prisma.url.findUnique({
        where: { shortCode },
        select: { id: true, originalUrl: true, isActive: true, expiresAt: true },
      });

      if (!url) {
        return res.status(404).json({ error: 'Short URL not found.' });
      }

      urlData = url;
      // Populate cache for next request
      await cacheService.setUrl(shortCode, urlData);
    }

    if (!urlData.isActive) {
      return res.status(410).json({ error: 'This URL has been deactivated.' });
    }

    if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'This URL has expired.' });
    }

    // Track click asynchronously (non-blocking)
    clickTracker.track(urlData.id, req);

    res.redirect(301, urlData.originalUrl);
  } catch (err) {
    next(err);
  }
};
