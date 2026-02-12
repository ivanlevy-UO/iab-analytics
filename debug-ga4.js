const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
require('dotenv').config();

async function testPageTitles() {
    const propertyId = process.env.GA_PROPERTY_ID;
    const client = new BetaAnalyticsDataClient({
        keyFilename: path.join(process.cwd(), 'credentials.json')
    });

    console.log('Fetching names for property:', propertyId);

    const request = {
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [
            { name: 'pagePath' },
            { name: 'pageTitle' }
        ],
        metrics: [
            { name: 'screenPageViews' }
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
        limit: 10
    };

    try {
        const [response] = await client.runReport(request);
        console.log('Results:');
        response.rows.forEach(row => {
            console.log(`- Path: ${row.dimensionValues[0].value}`);
            console.log(`  Title: ${row.dimensionValues[1].value}`);
            console.log(`  Views: ${row.metricValues[0].value}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

testPageTitles();
