export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number; // 4.5 or 5
  date: string;
  text: string;
  verified: boolean;
}

const FIRST_NAMES = [
  "Henrik", "Elena", "Claire", "Jan", "Lukas", "Emma", "Matteo", "Sofia",
  "Johan", "Marie", "Lars", "Anna", "Nils", "Isabella", "Alejandro", "Lucia",
  "Klaus", "Freja", "Mikkel", "Laura", "Sven", "Eva", "Giuseppe", "Giulia",
  "Bastian", "Camilla", "Leon", "Lea", "Oliver", "Chloe", "Maximilian", "Mia"
];

const LAST_NAMES = [
  "Lindqvist", "Rossi", "Moreau", "Kowalski", "Müller", "Dubois", "Ricci", "Schmidt",
  "Johansson", "Lefevre", "Andersen", "Romano", "Nielsen", "Martinez", "García", "Bianchi",
  "Fischer", "Jensen", "Sørensen", "Hansen", "Berg", "Larsen", "Ferrari", "Colombo",
  "Wagner", "Russo", "Weber", "Schulz", "Nilsen", "Olsen", "Meyer", "Hoffmann"
];

const CITIES = [
  "Stockholm, Sweden", "Bologna, Italy", "Lyon, France", "Kraków, Poland",
  "Berlin, Germany", "Munich, Germany", "Paris, France", "Milan, Italy",
  "Rome, Italy", "Copenhagen, Denmark", "Oslo, Norway", "Helsinki, Finland",
  "Vienna, Austria", "Zurich, Switzerland", "Geneva, Switzerland",
  "Madrid, Spain", "Barcelona, Spain", "Amsterdam, Netherlands",
  "Rotterdam, Netherlands", "Brussels, Belgium", "Prague, Czechia",
  "Warsaw, Poland", "Gothenburg, Sweden", "Turin, Italy"
];

const TEMPLATES = [
  "I've been incorporating [PRODUCT] into my therapeutic protocol for the last two months. The cold chain shipping to [CITY] was flawless. Definitely a 5-star experience, though it took an extra day in customs.",
  "The purity of this [PRODUCT] is immediately noticeable. I was previously using a different supplier, but the therapeutic results here are much more consistent. The 10mg size is exactly what I needed.",
  "Excellent quality. The packaging was highly secure and maintained temperature perfectly. I wish the protective caps were slightly easier to pop off, but otherwise flawless.",
  "Very satisfied with my purchase of [PRODUCT]. As someone who relies on this for therapeutic use, the verified COAs give me total peace of mind. Arrived in [CITY] faster than expected.",
  "Took an extra day to arrive due to local customs in [CITY], but completely worth it. The [PRODUCT] has been incredibly effective for my personal therapy regimen.",
  "I highly recommend [PRODUCT]. I've noticed significant improvements in my well-being since starting this therapeutic course. The customer support team was also very helpful with my dosage questions.",
  "Top-tier quality. The [PRODUCT] arrived exactly as described, properly chilled. The results have been consistent with high-purity compounds. Will definitely order again for my next cycle.",
  "A solid 4.5 stars. The therapeutic benefits of [PRODUCT] are undeniable. My only minor gripe is that I'd love to see a slightly more detailed usage guide included in the box.",
  "I've been using this specific [PRODUCT] formulation for my recovery therapy. The compound stability is excellent, even after a few weeks of use. Greetings from [CITY]!",
  "Perfect for my therapeutic needs. The [PRODUCT] was carefully packaged and the cold packs were still partially frozen upon arrival in [CITY]. Uncompromising quality.",
  "Honestly, [PRODUCT] has exceeded my expectations. The purity is clearly >99% as advertised. I use it strictly for my prescribed therapeutic routine and it's been fantastic.",
  "Great product, though the shipping box was slightly dented when it arrived in [CITY]. The [PRODUCT] vials inside were perfectly safe, however. Outstanding therapeutic efficacy!"
];

// Simple seeded random number generator (Mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a simple hash from a string to use as a seed
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function generateReviewsForProduct(productSlug: string, productName: string): Review[] {
  const seed = hashCode(productSlug);
  const random = mulberry32(seed);

  // Generate between 5 and 12 reviews
  const numReviews = Math.floor(random() * 8) + 5;
  const reviews: Review[] = [];
  
  // To avoid duplicate templates for the same product, we shuffle them using the seed
  const availableTemplates = [...TEMPLATES];
  for (let i = availableTemplates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [availableTemplates[i], availableTemplates[j]] = [availableTemplates[j], availableTemplates[i]];
  }

  // Generate recent dates (last 4 months)
  const now = new Date("2026-09-01T00:00:00Z").getTime();
  const fourMonthsMs = 4 * 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < numReviews; i++) {
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const city = CITIES[Math.floor(random() * CITIES.length)];
    
    // Rating: 4.5 or 5. 80% chance of 5.
    const isFiveStar = random() > 0.2;
    const rating = isFiveStar ? 5 : 4.5;
    
    const templateIndex = i % availableTemplates.length;
    let text = availableTemplates[templateIndex];
    
    // Shorten product name slightly if it's very long, or just use the full name
    const shortName = productName.replace(" (R&D)", "").replace(" R&D Only", "");
    
    text = text.replace(/\[PRODUCT\]/g, shortName);
    text = text.replace(/\[CITY\]/g, city);
    
    // Random date in the past 4 months
    const dateMs = now - (random() * fourMonthsMs);
    const dateObj = new Date(dateMs);
    const dateString = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    reviews.push({
      id: `${productSlug}-rev-${i}`,
      name: `${firstName} ${lastName.charAt(0)}.`, // e.g. Henrik L.
      location: city,
      rating,
      date: dateString,
      text,
      verified: true
    });
  }

  // Sort reviews by date descending (newest first)
  reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return reviews;
}
