const ga4Service = require('../services/ga4Service');
const titleService = require('../services/titleService');

/**
 * GET /api/analytics/pages
 * Returns metrics for all pages (filtered by noticia- and sorted by views)
 */
exports.getAllPages = async (req, res, next) => {
    try {
        const rawData = await ga4Service.fetchPageMetrics();

        // Enrich data with actual headlines
        const data = await Promise.all(rawData.map(async (item) => {
            const realTitle = await titleService.getTitle(item.pagePath);
            return {
                ...item,
                pageTitle: realTitle || item.pageTitle // Fallback to GA4 title if scraper fails
            };
        }));

        res.json({
            success: true,
            count: data.length,
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/analytics/page/:path
 * Returns metrics for a specific page path
 */
exports.getPageByPath = async (req, res, next) => {
    try {
        const { path: pagePath } = req.params;
        const data = await ga4Service.fetchPageMetrics({ pathFilter: `/${pagePath}` });

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the specified path',
            });
        }

        res.json({
            success: true,
            data: data[0],
        });
    } catch (error) {
        next(error);
    }
};
