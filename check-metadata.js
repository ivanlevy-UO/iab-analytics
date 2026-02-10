const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
require('dotenv').config();

async function checkMetadata() {
    const propertyId = process.env.GA_PROPERTY_ID;
    const credentialsPath = path.join(process.cwd(), 'credentials.json');

    const client = new BetaAnalyticsDataClient({
        keyFilename: credentialsPath,
    });

    try {
        const [metadata] = await client.getMetadata({
            name: `properties/${propertyId}/metadata`,
        });

        console.log('--- Realtime Dimensions ---');
        metadata.dimensions.filter(d => d.apiName.toLowerCase().includes('page') || d.apiName.toLowerCase().includes('path')).forEach(d => {
            console.log(`${d.apiName}: ${d.uiName}`);
        });

        console.log('\n--- Realtime Metrics ---');
        metadata.metrics.filter(m => m.apiName.toLowerCase().includes('user')).forEach(m => {
            console.log(`${m.apiName}: ${m.uiName}`);
        });

    } catch (error) {
        console.error('Error fetching metadata:', error);
    }
}

checkMetadata();
