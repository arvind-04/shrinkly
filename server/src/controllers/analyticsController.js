const prisma = require('../config/database');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUrls, totalClicks, clicksToday, topUrl] = await Promise.all([
      prisma.url.count({ where: { userId, isActive: true } }),
      prisma.click.count({
        where: { url: { userId } },
      }),
      prisma.click.count({
        where: {
          url: { userId },
          createdAt: { gte: today },
        },
      }),
      prisma.url.findFirst({
        where: { userId, isActive: true },
        include: { _count: { select: { clicks: true } } },
        orderBy: { clicks: { _count: 'desc' } },
      }),
    ]);

    res.json({
      totalUrls,
      totalClicks,
      clicksToday,
      topUrl: topUrl ? {
        id: topUrl.id,
        shortCode: topUrl.shortCode,
        originalUrl: topUrl.originalUrl,
        clicks: topUrl._count.clicks,
      } : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.getClicksOverTime = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    let interval;
    let groupBy;

    switch (period) {
      case '7d':
        interval = '7 days';
        groupBy = 'day';
        break;
      case '30d':
        interval = '30 days';
        groupBy = 'day';
        break;
      case '90d':
        interval = '90 days';
        groupBy = 'week';
        break;
      case '1y':
        interval = '365 days';
        groupBy = 'month';
        break;
      default:
        interval = '30 days';
        groupBy = 'day';
    }

    let data;
    if (groupBy === 'day') {
      data = await prisma.$queryRaw`
        SELECT DATE(c."createdAt") as date, COUNT(*)::int as count
        FROM clicks c
        JOIN urls u ON c."urlId" = u.id
        WHERE u."userId" = ${userId}
        AND c."createdAt" >= NOW() - CAST(${interval} AS INTERVAL)
        GROUP BY DATE(c."createdAt")
        ORDER BY date ASC
      `;
    } else if (groupBy === 'week') {
      data = await prisma.$queryRaw`
        SELECT DATE_TRUNC('week', c."createdAt") as date, COUNT(*)::int as count
        FROM clicks c
        JOIN urls u ON c."urlId" = u.id
        WHERE u."userId" = ${userId}
        AND c."createdAt" >= NOW() - CAST(${interval} AS INTERVAL)
        GROUP BY DATE_TRUNC('week', c."createdAt")
        ORDER BY date ASC
      `;
    } else {
      data = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', c."createdAt") as date, COUNT(*)::int as count
        FROM clicks c
        JOIN urls u ON c."urlId" = u.id
        WHERE u."userId" = ${userId}
        AND c."createdAt" >= NOW() - CAST(${interval} AS INTERVAL)
        GROUP BY DATE_TRUNC('month', c."createdAt")
        ORDER BY date ASC
      `;
    }

    res.json({ data, period, groupBy });
  } catch (err) {
    next(err);
  }
};

exports.getTopCountries = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const data = await prisma.$queryRaw`
      SELECT c.country, COUNT(*)::int as count
      FROM clicks c
      JOIN urls u ON c."urlId" = u.id
      WHERE u."userId" = ${userId}
      GROUP BY c.country
      ORDER BY count DESC
      LIMIT 10
    `;

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.getTopDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const data = await prisma.$queryRaw`
      SELECT c.device, COUNT(*)::int as count
      FROM clicks c
      JOIN urls u ON c."urlId" = u.id
      WHERE u."userId" = ${userId}
      GROUP BY c.device
      ORDER BY count DESC
    `;

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.getTopBrowsers = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const data = await prisma.$queryRaw`
      SELECT c.browser, COUNT(*)::int as count
      FROM clicks c
      JOIN urls u ON c."urlId" = u.id
      WHERE u."userId" = ${userId}
      GROUP BY c.browser
      ORDER BY count DESC
      LIMIT 10
    `;

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.getTopReferrers = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const data = await prisma.$queryRaw`
      SELECT c.referrer, COUNT(*)::int as count
      FROM clicks c
      JOIN urls u ON c."urlId" = u.id
      WHERE u."userId" = ${userId}
      GROUP BY c.referrer
      ORDER BY count DESC
      LIMIT 10
    `;

    res.json({ data });
  } catch (err) {
    next(err);
  }
};
