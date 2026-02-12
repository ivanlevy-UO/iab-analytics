const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(process.cwd(), 'titles-cache.json');
const BASE_URL = 'https://www.iabargentina.com.ar';

class TitleService {
    constructor() {
        this.cache = this.loadCache();
    }

    loadCache() {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
            }
        } catch (e) {
            console.error('Error loading title cache:', e);
        }
        return {};
    }

    saveCache() {
        try {
            fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
        } catch (e) {
            console.error('Error saving title cache:', e);
        }
    }

    async getTitle(pagePath) {
        // If it's already in cache, return it
        if (this.cache[pagePath]) {
            return this.cache[pagePath];
        }

        // Otherwise, fetch it from the website
        try {
            console.log(`Scraping title for: ${pagePath}`);
            const fullUrl = `${BASE_URL}${pagePath}`;
            const response = await axios.get(fullUrl, { timeout: 5000 });
            const $ = cheerio.load(response.data);

            // Extract H1 (usually the headline)
            let title = $('h1').first().text().trim();

            if (!title) {
                // Fallback to title tag if H1 is missing
                title = $('title').text().split('|')[0].trim();
            }

            if (title) {
                this.cache[pagePath] = title;
                this.saveCache();
                return title;
            }
        } catch (error) {
            console.error(`Error scraping ${pagePath}:`, error.message);
        }

        return null;
    }
}

module.exports = new TitleService();
