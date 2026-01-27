// Quick test file to verify scrapers work
import { scrapePSCJobs } from './services/scrapers/pscScraper.js';
import { scrapeBrighterMondayJobs } from './services/scrapers/brighterMondayScraper.js';

async function testScrapers() {
  console.log('🧪 Testing PSC Scraper...');
  const pscJobs = await scrapePSCJobs();
  console.log(`✅ PSC: Found ${pscJobs.length} jobs`);
  console.log('Sample job:', pscJobs[0]);
  
  console.log('\n🧪 Testing BrighterMonday Scraper...');
  const bmJobs = await scrapeBrighterMondayJobs();
  console.log(`✅ BrighterMonday: Found ${bmJobs.length} jobs`);
  console.log('Sample job:', bmJobs[0]);
}

testScrapers();