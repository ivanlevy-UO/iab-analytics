const ga4Service = require('../services/ga4Service');

/**
 * GET /api/analytics/pages
 * Returns metrics for all pages (filtered by noticia- and sorted by views)
 */
exports.getAllPages = async (req, res, next) => {
    try {
        const data = await ga4Service.fetchPageMetrics();
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
