import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 1. Postgres Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 2. The Route the Dashboard will call
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id, 
        t.name, 
        t.company,  
        t.position, 
        t.status, 
        t.county, 
        t.cohort,
        t.vetting_status AS "vettingStatus",
        t.suitability_score AS "suitabilityScore",
        COALESCE(
          (SELECT json_agg(skill_name) FROM talent_skills WHERE talent_id = t.id), 
          '[]'
        ) AS "skillsRequired"
      FROM talents t
      ORDER BY t.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this to your server.js
app.post('/api/jobs', async (req, res) => {
  const client = await pool.connect(); // Get a client for the transaction
  try {
    const { name, company, position, county, status, vetting_status, cohort, suitability_score, skills } = req.body;

    await client.query('BEGIN'); // Start Transaction

    const result = await client.query(
      `INSERT INTO talents (name, company, position, county, status, vetting_status, cohort, suitability_score) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [name, company, position, county, status, vetting_status, cohort, suitability_score]
    );
    const talentId = result.rows[0].id;

    if (skills && Array.isArray(skills)) {
      for (let skillName of skills) {
        await client.query(
          `INSERT INTO talent_skills (talent_id, skill_name) VALUES ($1, $2)`,
          [talentId, skillName]
        );
      }
    }

    await client.query('COMMIT'); // Save everything at once
    res.status(201).json({ ...req.body, id: talentId });
  } catch (err) {
    await client.query('ROLLBACK'); // Undo everything if ANY part fails
    console.error("DATABASE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release(); // Always release the client back to the pool
  }
});
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});