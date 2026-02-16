const fs = require('fs');

const names = ["John Kamau", "Mary Atieno", "Abdi Hassan", "Sarah Koech", "Kevin Omolo", "Faith Mutua", "Peter Kiprop", "Zainab Mohammed", "David Wekesa", "Cynthia Nyambura"];
const mdas = ["Ministry of ICT", "KRA", "NTSA", "Ministry of Health", "ICT Authority", "State Dept of Lands", "Public Service Commission", "EACC", "Konza Technopolis", "KenGen"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Garissa", "Nyeri", "Kiambu", "Kilifi", "Bungoma"];
const positions = ["ICT Officer Intern", "Cybersecurity Analyst", "Data Clerk", "Network Admin", "Frontend Developer", "Systems Support"];
const statuses = ["Available (Ex-Intern)", "MDA Rotation", "Deployment Ready", "Placed (Public)", "Placed (Private)"];
const cohorts = ["2021/22", "2022/23", "2023/24", "2024/25", "2025/26"];

const jobs = [];

for (let i = 1; i <= 100; i++) {
  const previousMDA = mdas[Math.floor(Math.random() * mdas.length)];
  const selectedCohort = cohorts[Math.floor(Math.random() * cohorts.length)];
  const score = Math.floor(Math.random() * 40) + 60;
  
  // NEW LOGIC: If they have a high score, they are more likely to be Vetted
  // This simulates the Ministry actually reviewing the top talent
  let vettingStatus = "Pending";
  if (score >= 85 && Math.random() > 0.3) {
    vettingStatus = "Vetted";
  }

  jobs.push({
    id: i.toString(),
    name: names[Math.floor(Math.random() * names.length)] + " " + (i + 100),
    company: mdas[Math.floor(Math.random() * mdas.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    county: counties[Math.floor(Math.random() * counties.length)],
    isVerified: Math.random() > 0.2,
    vettingStatus: vettingStatus, // <--- ADDED THIS LINE
    history: [
      {
        organization: previousMDA,
        role: "Graduate Intern",
        period: selectedCohort,
        rating: (Math.random() * (5 - 3) + 3).toFixed(1)
      }
    ],
    suitabilityScore: score,
    notes: `Cohort ${selectedCohort} intern from ${previousMDA}. Vetting status: ${vettingStatus}.`
  });
}

const db = { jobs };

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log("✅ 100 Records generated with Vetting Status!");