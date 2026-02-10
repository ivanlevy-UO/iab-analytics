const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
require('dotenv').config();

class GA4Service {
    constructor() {
        this.propertyId = process.env.GA_PROPERTY_ID;

        // Handle credentials from Environment Variable (for Vercel) or local file
        let credentials;
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            try {
                credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            } catch (e) {
                console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', e);
            }
        }

        const config = credentials
            ? { credentials }
            : { keyFilename: path.join(process.cwd(), 'credentials.json') };

        this.client = new BetaAnalyticsDataClient(config);
    }

    /**
     * Fetch traffic for all pages (Historical - Last 30 days)
     */
    async fetchPageMetrics(options = {}) {
        const { pathFilter } = options;

        const request = {
            property: `properties/${this.propertyId}`,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'userEngagementDuration' },
            ],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: {
                        matchType: 'CONTAINS',
                        value: 'noticia-',
                    },
                },
            },
            orderBys: [
                { metric: { metricName: 'screenPageViews' }, desc: true },
            ],
        };

        if (pathFilter) {
            request.dimensionFilter.filter = {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'EXACT', value: pathFilter }
            };
        }

        try {
            const [response] = await this.client.runReport(request);
            return this.transformHistoricalResponse(response);
        } catch (error) {
            console.error('GA4 Historical API Error:', error);
            throw new Error(`Error en API Histórica: ${error.message}`);
        }
    }

    /**
     * Transform Average engagement time per user
     */
    transformHistoricalResponse(response) {
        if (!response.rows) return [];
        return response.rows.map(row => {
            const views = parseInt(row.metricValues[0].value, 10);
            const users = parseInt(row.metricValues[1].value, 10);
            const totalDuration = parseFloat(row.metricValues[2].value); // In seconds

            return {
                pagePath: row.dimensionValues[0].value,
                screenPageViews: views,
                activeUsers: users,
                avgDuration: users > 0 ? (totalDuration / users).toFixed(1) : 0,
                engagementRate: users > 0 ? (views / users).toFixed(2) : 0
            };
        });
    }
}

module.exports = new GA4Service();
