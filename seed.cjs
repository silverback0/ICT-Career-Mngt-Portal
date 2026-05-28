require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const counties = [
  "Nairobi", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", 
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", 
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", 
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", 
  "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", 
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", 
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"
];

const cohorts = ["Cohort 2022/23", "Cohort 2023/24", "Cohort 2024/25"];
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "Amina", "Kiprop", "Wanjiku", "Otieno", "Musa", "Chebet", "Mutua", "Nyambura", "Hassan", "Atieno"];
const lastNames = ["Kamau", "Omondi", "Kipkorir", "Maina", "Mwangi", "Wanyama", "Njoroge", "Kuria", "Mulei", "Juma", "Mohammed", "Ali", "Ochieng", "Koech", "Wekesa", "Njuguna", "Ouma", "Kariuki", "Cheruiyot", "Makori"];
const positions = ["Software Engineer", "Data Scientist", "Cloud Architect", "UI/UX Designer", "Cybersecurity Analyst", "Network Engineer", "Database Admin"];
const companies = ["Safaricom", "KCB Bank", "Equity", "Microsoft ADC", "Google Kenya", "Andela", "ICT Authority"];
const skillOptions = ["React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "TypeScript", "UI/UX", "Cybersecurity"];
async function seed() {
  try {
    console.log("🌱 Starting Mega-Seed...");
    // Clear existing data
    await pool.query('TRUNCATE talent_skills, talents RESTART IDENTITY CASCADE');

    let totalSeeded = 0;

    for (const county of counties) {
      // 1. Pick a random number of people for THIS county
      const randomCount = Math.floor(Math.random() * 14) + 2;

      for (let i = 0; i < randomCount; i++) {
        // 2. Generate the person's data
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const company = companies[Math.floor(Math.random() * companies.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const score = Math.floor(Math.random() * (100 - 65 + 1)) + 65; 
        const status = Math.random() > 0.7 ? "Placed (Public)" : "Deployment Ready";

        // Randomly pick a cohort for THIS specific person
        const cohort = cohorts[Math.floor(Math.random() * cohorts.length)];

        // Insert Talent and get the ID back
        const talentRes = await pool.query(
          `INSERT INTO talents (name, company, position, status, county, suitability_score, vetting_status, cohort, is_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, 'Vetted', $7, true) RETURNING id`,
          [name, company, position, status, county, score, cohort]
        );

        const talentId = talentRes.rows[0].id

        // SEED SKILLS: This makes the "High-Demand Skills" chart work!
        // Give each person 2-3 random skills
        const numSkills = Math.floor(Math.random() * 2) + 2;
        const shuffledSkills = skillOptions.sort(() => 0.5 - Math.random());
        const selectedSkills = shuffledSkills.slice(0, numSkills);

        for (const skill of selectedSkills) {
          await pool.query(
            `INSERT INTO talent_skills (talent_id, skill_name) VALUES ($1, $2)`,
            [talentId, skill]
          );
        }

        totalSeeded++;
      }
    }

    console.log(`✅ Successfully seeded ${totalSeeded} talents across all ${counties.length} counties!`);

       /* await pool.query(
          `INSERT INTO talents (name, company, position, status, county, suitability_score, vetting_status, cohort, is_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, 'Vetted', '2023/24', true)`,
          [name, company, position, status, county, score]
        );
      }
    }
    console.log(`✅ Successfully seeded varied talents across all ${counties.length} counties!`);*/
    
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();