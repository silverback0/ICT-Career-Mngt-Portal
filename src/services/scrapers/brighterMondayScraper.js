import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes ICT jobs from BrighterMonday Kenya
 */
export async function scrapeBrighterMondayJobs() {
  try {
    // BrighterMonday search for IT jobs in Kenya
    const url = 'https://www.brightermonday.co.ke/jobs/technology-it';
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const jobs = [];
    
    // BrighterMonday-specific selectors (inspect their site for actual classes)
    $('.job__list--item, .search-result').slice(0, 20).each((index, element) => {
      const $job = $(element);
      
      const title = $job.find('.job__list__title, h2.job-title').text().trim();
      const company = $job.find('.job__list__company, .company-name').text().trim();
      const location = $job.find('.job__list__location, .location').text().trim();
      const link = $job.find('a').attr('href');
      
      if (title && company) {
        jobs.push({
          id: `bm-${Date.now()}-${index}`,
          title: title,
          company: company,
          description: `Private sector ICT role in ${location}`,
          location: location || 'Kenya',
          county: extractCounty(location) || 'Nairobi',
          jobSource: 'BrighterMonday',
          employmentType: 'Contract', // Most private sector
          skillsRequired: extractSkills(title),
          scrapedDate: new Date().toISOString(),
          link: link?.startsWith('http') ? link : `https://www.brightermonday.co.ke${link}`,
          isVerified: false, // Needs manual verification
          salaryRange: { min: 60000, max: 200000 }
        });
      }
    });
    
    console.log(`✅ BrighterMonday Scraper: Found ${jobs.length} jobs`);
    return jobs;
    
  } catch (error) {
    console.error('❌ BrighterMonday Scraper Error:', error.message);
    return [];
  }
}

// Reuse helper functions from pscScraper
function extractCounty(text) {
  const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  for (const county of counties) {
    if (new RegExp(county, 'i').test(text)) return county;
  }
  return 'Nairobi';
}

function extractSkills(text) {
  const skills = ['React', 'Python', 'Java', 'JavaScript', 'SQL', 'AWS', 'DevOps'];
  return skills.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text));
}