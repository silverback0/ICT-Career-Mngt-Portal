const fs = require('fs');

const names = ["John Kamau", "Mary Atieno", "Abdi Hassan", "Sarah Koech", "Kevin Omolo", "Faith Mutua", "Peter Kiprop", "Zainab Mohammed", "David Wekesa", "Cynthia Nyambura"];
const mdas = ["Ministry of ICT", "KRA", "NTSA", "Ministry of Health", "ICT Authority", "State Dept of Lands", "Public Service Commission", "EACC", "Konza Technopolis", "KenGen"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Garissa", "Nyeri", "Kiambu", "Kilifi", "Bungoma"];
const positions = ["ICT Officer Intern", "Cybersecurity Analyst", "Data Clerk", "Network Admin", "Frontend Developer", "Systems Support"];

// UPDATED STATUSES: Reflecting the PnP Pipeline
const statuses = ["Available (Ex-Intern)", "MDA Rotation", "Deployment Ready", "Placed (Public)", "Placed (Private)"];

const jobs = [];

for (let i = 1; i <= 100; i++) {
  const previousMDA = mdas[Math.floor(Math.random() * mdas.length)];
  
  jobs.push({
    id: i.toString(),
    name: names[Math.floor(Math.random() * names.length)] + " " + (i + 100),
    company: mdas[Math.floor(Math.random() * mdas.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    county: counties[Math.floor(Math.random() * counties.length)],
    isVerified: Math.random() > 0.2,
    
    // NEW: The "Talent History" logic inside the JSON
    history: [
      {
        organization: previousMDA,
        role: "Graduate Intern",
        period: "2023-2024",
        rating: (Math.random() * (5 - 3) + 3).toFixed(1) // Random rating between 3.0 and 5.0
      }
    ],
    suitabilityScore: Math.floor(Math.random() * 40) + 60, // Score between 60-100%
    notes: `Former intern at ${previousMDA}. Verified for PnP eligibility.`
  });
}

const db = { jobs };

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log("✅ 100 Talent Records with History generated in db.json!");