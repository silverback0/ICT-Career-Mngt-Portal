import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes ICT jobs from Public Service Commission
 * Returns standardized job objects
 */
export async function scrapePSCJobs() {
  try {
    const url = 'https://www.publicservice.go.ke/index.php/vacancies';
    
    // Add headers to avoid being blocked
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const $ = cheerio.load(data);
    const jobs = [];
    
    // PSC-specific selectors (you'll need to inspect their HTML)
    // This is a template - adjust based on actual PSC website structure
    $('.item-page table tr').each((index, element) => {
      if (index === 0) return; // Skip header row
      
      const cells = $(element).find('td');
      if (cells.length < 3) return;
      
      const title = $(cells[0]).text().trim();
      const details = $(cells[1]).text().trim();
      const deadline = $(cells[2]).text().trim();
      
      // Only include ICT-related jobs
      const isICTJob = /ICT|software|developer|IT|cyber|data|digital|tech|programmer/i.test(title + details);
      
      if (isICTJob && title) {
        jobs.push({
          id: `psc-${Date.now()}-${index}`,
          title: title,
          company: 'Public Service Commission of Kenya',
          description: details,
          location: extractLocation(details) || 'Kenya',
          county: extractCounty(details) || 'Nairobi',
          jobSource: 'PSC',
          employmentType: 'Permanent & Pensionable',
          skillsRequired: extractSkills(title + details),
          deadline: deadline,
          scrapedDate: new Date().toISOString(),
          link: url,
          isVerified: true, // PSC jobs are official
          salaryRange: { min: 50000, max: 150000 } // Typical gov range
        });
      }
    });
    
    console.log(`✅ PSC Scraper: Found ${jobs.length} ICT jobs`);
    return jobs;
    
  } catch (error) {
    console.error('❌ PSC Scraper Error:', error.message);
    return [];
  }
}

// Helper functions
function extractLocation(text) {
  const locationMatch = text.match(/\b(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika)\b/i);
  return locationMatch ? locationMatch[0] : null;
}

function extractCounty(text) {
  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 
    'Kiambu', 'Machakos', 'Kajiado', 'Murang\'a', 'Nyeri'
  ];
  
  for (const county of counties) {
    if (new RegExp(county, 'i').test(text)) {
      return county;
    }
  }
  return 'Nairobi'; // Default
}

function extractSkills(text) {
  const skillKeywords = [
    'React', 'JavaScript', 'Python', 'Java', 'Node.js', 'SQL', 
    'Cybersecurity', 'Data Analysis', 'Cloud', 'AWS', 'Azure',
    'DevOps', 'Network', 'Database', 'API', 'Mobile', 'Android',
    'iOS', 'PHP', 'Laravel', 'Django', 'Machine Learning', 'AI'
  ];
  
  return skillKeywords.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
}