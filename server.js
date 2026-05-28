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
    const { cohort } = req.query; // Get the cohort from the URL (e.g., /api/jobs?cohort=Cohort 2024/25)
    
    let queryText = `
      SELECT 
        t.id, t.name, t.company, t.position, t.status, t.county, 
        t.is_verified AS "isVerified", 
        t.vetting_status AS "vettingStatus", 
        t.suitability_score AS "suitabilityScore", 
        t.cohort,
        ARRAY_AGG(ts.skill_name) as "skillsRequired"
      FROM talents t
      LEFT JOIN talent_skills ts ON t.id = ts.talent_id
    `;

    const queryParams = [];

    // If a cohort is selected (and it's not "All Cohorts"), add a WHERE clause
    if (cohort && cohort !== 'All Cohorts') {
      queryText += ` WHERE t.cohort = $1`;
      queryParams.push(cohort);
    }

    queryText += ` GROUP BY t.id ORDER BY t.suitability_score DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Database Query Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add this to your server.js
app.post('/api/jobs', async (req, res) => {
  // Destructure using the EXACT keys sent from the modal
  const { 
    name, company, position, county, status, 
    vetting_status, cohort, suitability_score 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO talents (
        name, company, position, county, status, 
        vetting_status, cohort, suitability_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, company, position, county, status, vetting_status, cohort, suitability_score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message); // This will tell us if a column name is wrong
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});