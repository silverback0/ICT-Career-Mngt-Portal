import { scrapePSCJobs } from './pscScraper';
import { scrapeBrighterMondayJobs } from './brighterMondayScraper';

/**
 * Combines all scrapers and JSearch API
 * Returns unified job dataset
 */
export async function fetchAllJobs(jsearchApiKey) {
  console.log('🚀 Starting job aggregation...');
  
  const results = await Promise.allSettled([
    scrapePSCJobs(),
    scrapeBrighterMondayJobs(),
    fetchJSearchJobs(jsearchApiKey)
  ]);
  
  const allJobs = results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value);
  
  console.log(`✅ Total jobs collected: ${allJobs.length}`);
  return allJobs;
}

/**
 * Fetch jobs from JSearch API (your existing integration)
 */
async function fetchJSearchJobs(apiKey) {
  if (!apiKey) {
    console.warn('⚠️ No JSearch API key provided');
    return [];
  }
  
  try {
    const response = await fetch(
      'https://jsearch.p.rapidapi.com/search?query=software+developer+Kenya&num_pages=1',
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    
    return (data.data || []).map((job, index) => ({
      id: `jsearch-${job.job_id || index}`,
      title: job.job_title,
      company: job.employer_name,
      description: job.job_description,
      location: job.job_city || 'Kenya',
      county: job.job_city || 'Nairobi',
      jobSource: 'JSearch API',
      employmentType: job.job_employment_type || 'Full-time',
      skillsRequired: extractSkills(job.job_description || ''),
      scrapedDate: new Date().toISOString(),
      link: job.job_apply_link,
      isVerified: false,
      salaryRange: {
        min: job.job_min_salary || 0,
        max: job.job_max_salary || 0
      }
    }));
    
  } catch (error) {
    console.error('❌ JSearch API Error:', error);
    return [];
  }
}

function extractSkills(text) {
  const skills = ['React', 'Python', 'Java', 'JavaScript', 'SQL', 'AWS'];
  return skills.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text));
}