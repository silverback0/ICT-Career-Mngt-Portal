const { Pool } = require('pg');
const fs = require('fs');

// 1. Connection Config
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Griffin19',
  port: 5432,
});

async function migrate() {
  const data = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
  const client = await pool.connect();

  try {
    console.log("Starting migration...");
    await client.query('BEGIN');

    for (const job of data.jobs) {
      // Insert Talent
      const talentRes = await client.query(
        `INSERT INTO talents (name, company, position, status, county, is_verified, vetting_status, suitability_score, cohort) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [job.name, job.company, job.position, job.status, job.county, job.isVerified, job.vettingStatus, job.suitabilityScore, job.history[0]?.period]
      );
      
      const talentId = talentRes.rows[0].id;

      // Handle Skills
      if (job.skillsRequired) {
        for (const skillName of job.skillsRequired) {
          // Insert skill if it doesn't exist, get ID
          const skillRes = await client.query(
            `INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
            [skillName]
          );
          const skillId = skillRes.rows[0].id;

          // Link talent to skill
          await client.query(
            `INSERT INTO talent_skills (talent_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [talentId, skillId]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully migrated ${data.jobs.length} records to Postgres!`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Migration failed:", e);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();