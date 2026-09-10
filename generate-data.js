const fs = require('fs');

const firstNames = [
  "Lukas", "Leon", "Finn", "Paul", "Jonas", "Luis", "Maximilian", "Emil", "Felix", "Moritz",
  "Emma", "Mia", "Hannah", "Emilia", "Sofia", "Lina", "Anna", "Mila", "Lea", "Ella",
  "Gabriel", "Arthur", "Gaspard", "Jules", "Louis", "Maël", "Adam", "Hugo", "Leo", "Raphaël",
  "Jade", "Louise", "Ambre", "Alba", "Rose", "Alice", "Romy", "Anna", "Lina",
  "Francesco", "Leonardo", "Alessandro", "Lorenzo", "Mattia", "Andrea", "Gabriele", "Riccardo", "Tommaso", "Edoardo",
  "Aurora", "Giulia", "Ginevra", "Beatrice", "Giorgia", "Vittoria", "Matilde",
  "Mateo", "Martin", "Lucas", "Daniel", "Alejandro", "Manuel", "Pablo", "Alvaro",
  "Lucia", "Martina", "Maria", "Valeria", "Julia", "Paula", "Daniela", "Carla",
  "Liam", "Noah", "Oliver", "Elijah", "William", "James", "Benjamin", "Henry", "Alexander",
  "Olivia", "Charlotte", "Amelia", "Ava", "Sophia", "Isabella", "Evelyn", "Harper",
  "Jack", "Thomas", "Joshua", "Matthew", "Joseph", "Harry", "Samuel",
  "Chloe", "Emily", "Megan", "Jessica", "Lauren", "Sophie", "Lucy"
];

const lastNames = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
  "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent",
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
  "Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez",
  "Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright",
  "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Wood", "Jackson", "Clarke",
  "O'Brien", "Kelly", "Sullivan", "Walsh", "Murphy", "O'Connor", "O'Neill", "Byrne", "Ryan", "Doyle",
  "Andersen", "Nielsen", "Hansen", "Pedersen", "Larsen", "Jensen", "Christensen", "Sørensen", "Johansen", "Olsen",
  "Johansson", "Andersson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson",
  "Korhonen", "Virtanen", "Mäkinen", "Nieminen", "Mäkelä", "Hämäläinen", "Laine", "Heikkinen", "Koskinen", "Järvinen"
];

const finalCities = [
  "London, UK", "Manchester, UK", "Birmingham, UK", "Edinburgh, UK", "Glasgow, UK", "Cardiff, UK", "Belfast, UK",
  "Dublin, Ireland", "Cork, Ireland", "Galway, Ireland",
  "Paris, France", "Lyon, France", "Marseille, France", "Nice, France",
  "Berlin, Germany", "Munich, Germany", "Hamburg, Germany", "Frankfurt, Germany",
  "Rome, Italy", "Milan, Italy", "Naples, Italy", "Turin, Italy",
  "Madrid, Spain", "Barcelona, Spain", "Valencia, Spain", "Seville, Spain",
  "Amsterdam, Netherlands", "Rotterdam, Netherlands", "Utrecht, Netherlands",
  "Vienna, Austria", "Salzburg, Austria",
  "Zurich, Switzerland", "Geneva, Switzerland", "Basel, Switzerland",
  "Stockholm, Sweden", "Gothenburg, Sweden",
  "Oslo, Norway", "Bergen, Norway",
  "Copenhagen, Denmark", "Aarhus, Denmark",
  "Helsinki, Finland",
  "Warsaw, Poland", "Krakow, Poland",
  "Prague, Czechia", "Brno, Czechia",
  "Budapest, Hungary",
  "Brussels, Belgium", "Antwerp, Belgium",
  "Lisbon, Portugal", "Porto, Portugal",
  "Athens, Greece", "Thessaloniki, Greece",
  "Sydney, AUS", "Melbourne, AUS", "Brisbane, AUS", "Perth, AUS", "Adelaide, AUS", "Gold Coast, AUS"
];

const generatedNames = new Set();
const pairs = [];
let i = 0;

while(pairs.length < 300) {
    let f = firstNames[Math.floor(Math.random() * firstNames.length)];
    let l = lastNames[Math.floor(Math.random() * lastNames.length)];
    let fullName = f + " " + l.charAt(0) + "."; // e.g., Lukas M.
    
    if (!generatedNames.has(fullName)) {
        generatedNames.add(fullName);
        pairs.push({
            buyerName: fullName,
            location: finalCities[i % finalCities.length]
        });
        i++;
    }
}

const fileContent = `export const notificationBuyers = ${JSON.stringify(pairs, null, 2)};\n`;
fs.writeFileSync('lib/notification-data.ts', fileContent);
console.log("Generated 300 pairs");
