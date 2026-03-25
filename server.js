import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 1. Postgres Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Griffin19',
  port: 5432,
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
        t.is_verified AS "isVerified", 
        t.vetting_status AS "vettingStatus", 
        t.suitability_score AS "suitabilityScore", 
        t.cohort,
        ARRAY_AGG(s.name) as "skillsRequired"
      FROM talents t
      LEFT JOIN talent_skills ts ON t.id = ts.talent_id
      LEFT JOIN skills s ON ts.skill_id = s.id
      GROUP BY t.id
      ORDER BY t.suitability_score DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});