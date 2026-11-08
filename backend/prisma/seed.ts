import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EXIMIA Journey Composer Latvia Seed Data...');

  // Clean existing records in reverse dependency order
  await prisma.approval.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.module.deleteMany();
  await prisma.capability.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (Admin & Prime Assist Operator)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Eximia2026!', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@eximia.lv',
      password_hash: passwordHash,
      full_name: 'Arturs Kļaviņš (EXIMIA Architect)',
      role: 'ADMIN',
      is_active: true,
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@primeassist.lv',
      password_hash: passwordHash,
      full_name: 'Jānis Bērziņš (Prime Assist Operations Desk)',
      role: 'OPERATOR',
      is_active: true,
    },
  });

  console.log('✅ Created users: admin@eximia.lv, operator@primeassist.lv (Password: Eximia2026!)');

  // 2. Seed Suppliers
  // Hotels
  const grandPalace = await prisma.supplier.create({
    data: {
      name: 'Grand Palace Hotel Riga',
      category: 'Hotel',
      season: 'All',
      capacity: 110,
      price_range: 'Luxury',
      location: 'Pils iela 12, Riga (Old Town)',
      latitude: 56.9505,
      longitude: 24.1044,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Inese Kalniņa',
      contact_email: 'concierge@grandpalaceriga.lv',
      description: 'Historical 5-star boutique hotel in the quiet heart of Vecrīga, featuring refined luxury suites and courtyard dining.',
    },
  });

  const grandPoet = await prisma.supplier.create({
    data: {
      name: 'Grand Poet Hotel',
      category: 'Hotel',
      season: 'All',
      capacity: 300,
      price_range: 'Premium',
      location: 'Raiņa bulvāris 5/6, Riga (Bastion Hill)',
      latitude: 56.9518,
      longitude: 24.1118,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German', 'Spanish']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Mārtiņš Ozols',
      contact_email: 'reservations@grandpoet.lv',
      description: 'Sophisticated design & wellness hotel nestled opposite Bastion Hill park and Freedom Boulevard, featuring luxury spa vitality pool.',
    },
  });

  const radissonLatvija = await prisma.supplier.create({
    data: {
      name: 'Radisson Blu Latvija',
      category: 'Hotel',
      season: 'All',
      capacity: 1000,
      price_range: 'Standard',
      location: 'Elizabetes iela 55, Riga',
      latitude: 56.9555,
      longitude: 24.1189,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German', 'French']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Dace Liepa',
      contact_email: 'latvija.events@radissonblu.com',
      description: 'Landmark modern hotel with panoramic skyline bar on the 26th floor and premier conference facilities.',
    },
  });

  // Restaurants
  const threeChefs = await prisma.supplier.create({
    data: {
      name: '3 Pavāru (3 Chefs Restaurant)',
      category: 'Restaurant',
      season: 'All',
      capacity: 80,
      price_range: 'Premium',
      location: 'Torņa iela 4, Jacob’s Barracks, Riga',
      latitude: 56.9520,
      longitude: 24.1055,
      languages_supported: JSON.stringify(['English', 'Latvian', 'French']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Chef Ēriks Dreibants',
      contact_email: 'info@3pavari.lv',
      description: 'Renowned open kitchen restaurant famous for Nordic-Latvian culinary artistry, forest-foraged ingredients, and interactive sauces.',
    },
  });

  const rozengrals = await prisma.supplier.create({
    data: {
      name: 'Rozengrāls',
      category: 'Restaurant',
      season: 'All',
      capacity: 150,
      price_range: 'Premium',
      location: 'Rozena iela 1, Riga (Old Town)',
      latitude: 56.9489,
      longitude: 24.1059,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German', 'Italian']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Aleksejs Vītols',
      contact_email: 'info@rozengrals.lv',
      description: 'Authentic 13th-century subterranean vaulted tavern illuminated entirely by candlelight with period live music and Hanseatic banquets.',
    },
  });

  // Activities
  const rigaWalkingTours = await prisma.supplier.create({
    data: {
      name: 'Riga Old Town Walking Tour',
      category: 'Activity',
      season: 'All',
      capacity: 25,
      price_range: 'Standard',
      location: 'Town Hall Square, Vecrīga',
      latitude: 56.9475,
      longitude: 24.1065,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German', 'Spanish']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Elīna Krūmiņa',
      contact_email: 'tours@rigawalks.lv',
      description: 'Intimate walking journey across 800 years of Riga history, House of Blackheads, Dome Cathedral, and hidden guild courtyards.',
    },
  });

  const siguldaNature = await prisma.supplier.create({
    data: {
      name: 'Sigulda Nature Tour',
      category: 'Activity',
      season: 'All',
      capacity: 20,
      price_range: 'Premium',
      location: 'Sigulda, Gauja Valley',
      latitude: 57.1537,
      longitude: 24.8542,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Kaspars Bērziņš',
      contact_email: 'nature@siguldatours.lv',
      description: 'Exploration of Switzerland of Vidzeme: primeval sandstone caves, Gutmanis spring, and medieval Turaida Castle fortress.',
    },
  });

  const gaujaPark = await prisma.supplier.create({
    data: {
      name: 'Gauja National Park',
      category: 'Activity',
      season: 'All',
      capacity: 40,
      price_range: 'Premium',
      location: 'Cēsis & Gauja Valley',
      latitude: 57.3129,
      longitude: 25.2747,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Gunta Zaķe',
      contact_email: 'adventures@gaujapark.lv',
      description: 'Outdoor wilderness adventures, river canoeing, medieval Cēsis Castle lantern tour, and bobsleigh thrills.',
    },
  });

  const daugavaCruise = await prisma.supplier.create({
    data: {
      name: 'Daugava River Cruise',
      category: 'Activity',
      season: 'Summer',
      capacity: 60,
      price_range: 'Standard',
      location: '11. Novembra krastmala, Riga Waterfront',
      latitude: 56.9452,
      longitude: 24.1030,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M3',
      contact_name: 'Juris Vilks',
      contact_email: 'captain@daugavacruise.lv',
      description: 'Panoramic riverboat navigation along the River of Destiny viewing Riga skyline, TV tower, and bridges.',
    },
  });

  const potteryWorkshop = await prisma.supplier.create({
    data: {
      name: 'Pottery Workshop',
      category: 'Activity',
      season: 'All',
      capacity: 12,
      price_range: 'Standard',
      location: 'Latgale Traditions Center / Riga Atelier',
      latitude: 56.9530,
      longitude: 24.1200,
      languages_supported: JSON.stringify(['English', 'Latvian']),
      status: 'ACTIVE',
      maturity_level: 'M3',
      contact_name: 'Meistars Andris Ušpelis',
      contact_email: 'ceramics@maraheritage.lv',
      description: 'Hands-on masterclass shaping authentic Baltic black ceramics on a wooden potter’s wheel and ancient wood-kiln firing.',
    },
  });

  const latvianCooking = await prisma.supplier.create({
    data: {
      name: 'Latvian Cooking Class',
      category: 'Activity',
      season: 'All',
      capacity: 16,
      price_range: 'Premium',
      location: 'Riga Central Market Gastronomy Pavilion',
      latitude: 56.9439,
      longitude: 24.1158,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M3',
      contact_name: 'Liene Tomase',
      contact_email: 'taste@latvianculinary.lv',
      description: 'Interactive cooking masterclass: traditional sourdough rye bread kneading, hemp butter making, and grey peas with smoked speck.',
    },
  });

  const balticWayHistory = await prisma.supplier.create({
    data: {
      name: 'Baltic Way History Experience',
      category: 'Activity',
      season: 'All',
      capacity: 30,
      price_range: 'Standard',
      location: 'Freedom Boulevard & Barricades Museum, Riga',
      latitude: 56.9515,
      longitude: 24.1132,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Valdis Celms',
      contact_email: 'history@balticway.lv',
      description: 'Curated deep-dive into the 1989 peaceful revolution, human chain archives, Barricades of 1991, and national rebirth.',
    },
  });

  // Transport
  const chauffeurService = await prisma.supplier.create({
    data: {
      name: 'Chauffeur Service',
      category: 'Transport',
      season: 'All',
      capacity: 7,
      price_range: 'Luxury',
      location: 'Riga Metropolitan & Pan-Baltic Routes',
      latitude: 56.9496,
      longitude: 24.1052,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Artis Siliņš',
      contact_email: 'vip@primechauffeur.lv',
      description: 'Executive private transport with immaculate Mercedes-Benz V-Class and S-Class fleet, certified multilingual chauffeurs.',
    },
  });

  const airportTransfer = await prisma.supplier.create({
    data: {
      name: 'Airport Transfer',
      category: 'Transport',
      season: 'All',
      capacity: 8,
      price_range: 'Standard',
      location: 'RIX Riga International Airport to City',
      latitude: 56.9236,
      longitude: 23.9711,
      languages_supported: JSON.stringify(['English', 'Latvian', 'German']),
      status: 'ACTIVE',
      maturity_level: 'M4',
      contact_name: 'Gatis Liepiņš',
      contact_email: 'dispatch@rixexpress.lv',
      description: 'Punctual meet & greet arrivals service at Riga International Airport with flight tracking and direct transfer.',
    },
  });

  console.log('✅ Created 14 Latvia Suppliers');

  // 3. Seed Capabilities (Latent and operational)
  const capCeramics = await prisma.capability.create({
    data: {
      supplier_id: potteryWorkshop.supplier_id,
      name: 'Black Clay Latgalian Pottery Wheel Masterclass',
      category: 'Craftsmanship',
      participation_mode: 'Make',
      is_winter_capable: true,
      is_private_group_feasible: true,
      min_capacity: 1,
      max_capacity: 12,
      operating_boundaries: 'Requires heated studio during winter; raw clay drying cycle requires 48 hours for kiln firing.',
    },
  });

  const capCuisine = await prisma.capability.create({
    data: {
      supplier_id: latvianCooking.supplier_id,
      name: 'Traditional Rye Sourdough Kneading & Herb Infusion',
      category: 'Gastronomy',
      participation_mode: 'Make',
      is_winter_capable: true,
      is_private_group_feasible: true,
      min_capacity: 2,
      max_capacity: 16,
      operating_boundaries: 'Dietary adjustments (vegetarian/gluten-free variants) require 24h advance notice.',
    },
  });

  const capNature = await prisma.capability.create({
    data: {
      supplier_id: siguldaNature.supplier_id,
      name: 'Gauja Valley Primeval Sandstone Trail Navigation',
      category: 'Eco-Exploration',
      participation_mode: 'Move',
      is_winter_capable: true,
      is_private_group_feasible: true,
      min_capacity: 2,
      max_capacity: 20,
      operating_boundaries: 'Winter snowshoeing gear supplied when snow depth exceeds 15cm; sturdy walking shoes required.',
    },
  });

  const capMedievalDining = await prisma.capability.create({
    data: {
      supplier_id: rozengrals.supplier_id,
      name: 'Subterranean Medieval Vault Private Banquet',
      category: 'Hospitality',
      participation_mode: 'Interact',
      is_winter_capable: true,
      is_private_group_feasible: true,
      min_capacity: 4,
      max_capacity: 40,
      operating_boundaries: 'Heated stone vaults operational year-round; live harp and lute accompaniment on request.',
    },
  });

  // 4. Seed Modules (Discrete Experience Node Passports)
  // HOTELS (M4)
  await prisma.module.create({
    data: {
      supplier_id: grandPoet.supplier_id,
      title: 'Grand Poet Hotel Design Room & Hedonic Spa Access',
      description: 'Overnight in contemporary boutique luxury with 15-meter vitality wellness pool, aroma sauna, and park vistas.',
      category: 'Hotel',
      route_code: 'RIGA_GATEWAY',
      seasonal_lens: 'Expansion',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'HNW/UHNW', 'Wellness', 'Cultural Explorers']),
      duration_hours: 24.0,
      indicative_price_eur: 195.0,
      price_tier: 'Premium',
      location_name: 'Riga Center / Bastion Hill',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Contracted rates with Prime Assist; verified junior suites available with connecting rooms for families.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: grandPalace.supplier_id,
      title: 'Grand Palace Old Town Heritage Suite Stay',
      description: 'Exclusive 5-star heritage hospitality inside a 1877 landmark residence in the historical embassy quarter.',
      category: 'Hotel',
      route_code: 'RIGA_GATEWAY',
      seasonal_lens: 'Expansion',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['HNW/UHNW', 'Business Leaders', 'Luxury Experiences']),
      duration_hours: 24.0,
      indicative_price_eur: 290.0,
      price_tier: 'Luxury',
      location_name: 'Vecrīga (Old Town)',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Direct supplier partnership; includes private valet and turn-down amenities.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: radissonLatvija.supplier_id,
      title: 'Radisson Blu Superior Room & Skyline Experience',
      description: 'Modern comfort with panoramic floor-to-ceiling vistas over Riga’s wooden architectural district.',
      category: 'Hotel',
      route_code: 'RIGA_GATEWAY',
      seasonal_lens: 'Expansion',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Business Leaders', 'MICE', 'Standard']),
      duration_hours: 24.0,
      indicative_price_eur: 130.0,
      price_tier: 'Standard',
      location_name: 'Riga Downtown',
      maturity_level: 'M4',
      requires_human_quote: false,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Instant corporate inventory allocation with high-speed fiber internet.',
    },
  });

  // RESTAURANTS (M4)
  await prisma.module.create({
    data: {
      supplier_id: threeChefs.supplier_id,
      title: '3 Pavāru Seasonal Nordic-Latvian Chef’s Tasting Menu',
      description: 'Multi-course contemporary culinary performance prepared before your eyes using local forest, river, and farm harvests.',
      category: 'Restaurant',
      route_code: 'MARA',
      seasonal_lens: 'Integration',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'Cultural Explorers', 'HNW/UHNW']),
      duration_hours: 2.5,
      indicative_price_eur: 85.0,
      price_tier: 'Premium',
      location_name: 'Jacob’s Barracks, Riga',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Table allocation pre-reserved for EXIMIA guests; includes personalized welcome by head chef.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: rozengrals.supplier_id,
      title: 'Rozengrāls Subterranean Medieval Feast',
      description: 'Candlelit dining in authentic 13th-century wine cellars with roast venison, spelt porridge, and honey beer.',
      category: 'Restaurant',
      route_code: 'DAUGAVA',
      seasonal_lens: 'Silence',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'Cultural Explorers']),
      duration_hours: 2.0,
      indicative_price_eur: 55.0,
      price_tier: 'Standard',
      location_name: 'Vecrīga',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Historic vaulted atmosphere; excellent family ambiance with costumed musicians.',
    },
  });

  // ACTIVITIES (M3 / M4)
  await prisma.module.create({
    data: {
      supplier_id: rigaWalkingTours.supplier_id,
      title: 'Vecrīga Hidden Courtyards & Art Nouveau Architectural Odyssey',
      description: 'Private guided exploration through cobblestone alleyways, medieval merchant guilds, and the world-renowned Alberta Street facades.',
      category: 'Activity',
      route_code: 'RIGA_GATEWAY',
      seasonal_lens: 'Awakening',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'Cultural Explorers', 'HNW/UHNW']),
      duration_hours: 3.0,
      indicative_price_eur: 90.0,
      price_tier: 'Standard',
      location_name: 'Riga Historic Center',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Certified licensed architectural historians; includes heated resting breaks in winter.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: siguldaNature.supplier_id,
      capability_id: capNature.capability_id,
      title: 'Sigulda & Gauja Valley Ancient River Trail',
      description: 'Immersive guided journey along Gutmanis sandstone cave, scenic cable car over Gauja river, and medieval Turaida Castle gardens.',
      category: 'Activity',
      route_code: 'DAUGAVA',
      seasonal_lens: 'Integration',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn']),
      target_segments: JSON.stringify(['Families', 'Nature Explorers', 'Cultural Explorers']),
      duration_hours: 5.5,
      indicative_price_eur: 160.0,
      price_tier: 'Premium',
      location_name: 'Sigulda & Gauja National Park',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Includes national park passes and cable car private reservation.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: balticWayHistory.supplier_id,
      title: 'Baltic Way & Freedom Trail Memorial Exploration',
      description: 'An emotional, firsthand retrospective of the 1989 Singing Revolution, Freedom Monument guards ceremony, and Barricades of 1991.',
      category: 'Activity',
      route_code: 'BALTIC_WAY',
      seasonal_lens: 'Awakening',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Cultural Explorers', 'Education', 'Families']),
      duration_hours: 3.5,
      indicative_price_eur: 85.0,
      price_tier: 'Standard',
      location_name: 'Freedom Boulevard, Riga',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Archival film screening and meeting with participant witness of the 1989 chain.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: potteryWorkshop.supplier_id,
      capability_id: capCeramics.capability_id,
      title: 'Māra Traditions: Master Potter’s Black Ceramic Workshop',
      description: 'Shape your own Latvian clay talisman or vessel alongside an authentic Latgalian craftsman using traditional herbal glazes.',
      category: 'Activity',
      route_code: 'MARA',
      seasonal_lens: 'Silence',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'Cultural Explorers', 'Wellness']),
      duration_hours: 2.5,
      indicative_price_eur: 75.0,
      price_tier: 'Standard',
      location_name: 'Latgale / Riga Craft Quarter',
      maturity_level: 'M3',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'M3 status verified; materials and shipping of fired pieces included.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: latvianCooking.supplier_id,
      capability_id: capCuisine.capability_id,
      title: 'Latvian Cooking Masterclass & Central Market Forage',
      description: 'Private morning market excursion sourcing farm cheeses, smoked fish, and pickles followed by hands-on culinary preparation.',
      category: 'Activity',
      route_code: 'MARA',
      seasonal_lens: 'Integration',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'Food Lovers', 'Cultural Explorers']),
      duration_hours: 4.0,
      indicative_price_eur: 110.0,
      price_tier: 'Premium',
      location_name: 'Riga Central Market Zeppelins',
      maturity_level: 'M3',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Includes tasting apron, recipe booklet, and multi-dish family lunch.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: daugavaCruise.supplier_id,
      title: 'Daugava River Sunset Panorama on Wooden Riverboat',
      description: 'Gliding along the majestic Daugava waterway under Riga’s iconic bridges as dusk settles over Old Town church spires.',
      category: 'Activity',
      route_code: 'DAUGAVA',
      seasonal_lens: 'Expansion',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn']),
      target_segments: JSON.stringify(['Families', 'Romantic Couples', 'Cultural Explorers']),
      duration_hours: 1.5,
      indicative_price_eur: 45.0,
      price_tier: 'Budget',
      location_name: 'Daugava Waterfront',
      maturity_level: 'M3',
      requires_human_quote: false,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Operational May through October; weather-contingent fallback provided.',
    },
  });

  // TRANSPORTS (M4)
  await prisma.module.create({
    data: {
      supplier_id: chauffeurService.supplier_id,
      title: 'Executive Private Chauffeur Day Escort (Mercedes V-Class)',
      description: 'Dedicated professional chauffeur and luxury vehicle on standby for regional route excursions and comfort stops.',
      category: 'Transport',
      route_code: 'RIGA_GATEWAY',
      seasonal_lens: 'Expansion',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'HNW/UHNW', 'Business Leaders']),
      duration_hours: 8.0,
      indicative_price_eur: 280.0,
      price_tier: 'Luxury',
      location_name: 'All Latvia Routes',
      maturity_level: 'M4',
      requires_human_quote: true,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Prime Assist verified fleet; includes bottled spring water, Wi-Fi, child safety seats.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: airportTransfer.supplier_id,
      title: 'VIP Airport Meet & Greet Transfer (RIX to Hotel)',
      description: 'Personalized arrival greeting at gate, luggage handling, and direct transport to central Riga hotel.',
      category: 'Transport',
      route_code: 'RIGA_GATEWAY',
      seasonal_lens: 'Expansion',
      seasons_supported: JSON.stringify(['Spring', 'Summer', 'Autumn', 'Winter']),
      target_segments: JSON.stringify(['Families', 'HNW/UHNW', 'Standard']),
      duration_hours: 1.0,
      indicative_price_eur: 65.0,
      price_tier: 'Standard',
      location_name: 'Riga International Airport (RIX)',
      maturity_level: 'M4',
      requires_human_quote: false,
      provenance: 'APPROVED_COMMERCIAL',
      evidence_notes: 'Live flight tracking and 60 minutes complimentary waiting window.',
    },
  });

  // DEMO CO-DESIGN PROPOSALS / UNVALIDATED MODULES (M1 & M2)
  // Demonstrating the upstream capability development pipeline (Hidden from customers!)
  await prisma.module.create({
    data: {
      supplier_id: potteryWorkshop.supplier_id,
      title: 'Private Winter Candlelit Clay & Herbal Smoke Sauna Ritual',
      description: 'Experimental co-designed winter offering combining thermal clay wrapping, authentic sauna whisking, and quiet daina chanting.',
      category: 'Activity',
      route_code: 'MARA',
      seasonal_lens: 'Silence',
      seasons_supported: JSON.stringify(['Winter']),
      target_segments: JSON.stringify(['HNW/UHNW', 'Wellness']),
      duration_hours: 4.0,
      indicative_price_eur: 220.0,
      price_tier: 'Luxury',
      location_name: 'Latgale Sauna Lodge',
      maturity_level: 'M2', // M2 is NOT customer visible! For operator co-design testing only!
      requires_human_quote: true,
      provenance: 'CO_DESIGN_PROPOSAL',
      evidence_notes: 'Pending field dry run with Jānis on Nov 15; sauna heating consistency must be certified.',
    },
  });

  await prisma.module.create({
    data: {
      supplier_id: gaujaPark.supplier_id,
      title: 'Nighttime Gauja Bobsleigh Under Floodlights',
      description: 'Candidate adventure concept for private corporate delegations; ice track descent with professional pilot.',
      category: 'Activity',
      route_code: 'JACOB',
      seasonal_lens: 'Silence',
      seasons_supported: JSON.stringify(['Winter']),
      target_segments: JSON.stringify(['Business Leaders', 'Adventure']),
      duration_hours: 2.0,
      indicative_price_eur: 180.0,
      price_tier: 'Premium',
      location_name: 'Sigulda Bobsleigh Track',
      maturity_level: 'M1', // M1 is NOT customer visible!
      requires_human_quote: true,
      provenance: 'SUPPLIER_CLAIM',
      evidence_notes: 'Initial interview conducted; medical clearance protocols pending verification.',
    },
  });

  console.log('✅ Created 15 Experience Modules (including M3/M4 customer-ready and M1/M2 co-design candidates)');

  // 5. Seed Demo Customer Request and Journey in OPS_REVIEW (To demonstrate the human validation workflow)
  const demoCustomer = await prisma.customer.create({
    data: {
      user_id: null,
      full_name: 'Sophia & Alexander Vance',
      email: 'sophia.vance@example.com',
      phone: '+44 7700 900123',
      trip_purpose: 'Cultural Discovery',
      traveller_type: 'Family',
      duration_days: 5,
      season: 'Summer',
      budget_level: 'Premium',
      special_needs: 'Travelling with two children (ages 8 and 11). Prefer barrier-free routes and child-friendly dining.',
      selected_interests: JSON.stringify(['Culture', 'Nature', 'Food']),
    },
  });

  const demoJourney = await prisma.journey.create({
    data: {
      customer_id: demoCustomer.customer_id,
      title: 'Vance Family Cultural Discovery along the Baltic Way & Māra Road',
      summary: 'A bespoke 5-day family exploration through Riga’s Hanseatic secrets, the picturesque Gauja river valley, and hands-on Latvian culinary traditions.',
      status: 'OPS_REVIEW', // In review state to showcase human operator dashboard!
      total_days: 5,
      season: 'Summer',
      primary_route: 'BALTIC_WAY',
      estimated_budget_eur: 1850.0,
      budget_tier: 'Premium',
      ai_confidence_score: 0.94,
      ai_rationale: 'Composed for a family of 4 seeking cultural depth without excessive transit fatigue. Integrates interactive hands-on workshops (cooking & pottery), UNESCO Old Town exploration, and scenic Sigulda nature walks, matching Summer expansion conditions.',
      operator_notes: 'Submitted to Prime Assist desk. Lead curator reviewing family suite availability at Grand Poet Hotel and child safety seats for chauffeur transfer.',
    },
  });

  // Fetch some modules for the demo itinerary
  const mHotel = await prisma.module.findFirst({ where: { category: 'Hotel', supplier_id: grandPoet.supplier_id } });
  const mTransfer = await prisma.module.findFirst({ where: { category: 'Transport', supplier_id: airportTransfer.supplier_id } });
  const mWalk = await prisma.module.findFirst({ where: { category: 'Activity', supplier_id: rigaWalkingTours.supplier_id } });
  const mDinner = await prisma.module.findFirst({ where: { category: 'Restaurant', supplier_id: rozengrals.supplier_id } });
  const mSigulda = await prisma.module.findFirst({ where: { category: 'Activity', supplier_id: siguldaNature.supplier_id } });
  const m3Pavari = await prisma.module.findFirst({ where: { category: 'Restaurant', supplier_id: threeChefs.supplier_id } });

  if (mHotel && mTransfer && mWalk && mDinner && mSigulda && m3Pavari) {
    await prisma.itinerary.createMany({
      data: [
        {
          journey_id: demoJourney.journey_id,
          day_number: 1,
          time_slot: 'MORNING',
          module_id: mTransfer.module_id,
          custom_title: 'Airport Meet & VIP Family Transfer',
          notes: 'Driver greeting with Vance nameboard and luggage assistance.',
          why_recommended: 'Seamless arrival without airport transit stress for family with kids.',
          sort_order: 1,
        },
        {
          journey_id: demoJourney.journey_id,
          day_number: 1,
          time_slot: 'AFTERNOON',
          module_id: mWalk.module_id,
          custom_title: 'Vecrīga Legends & Guild Courtyards',
          notes: 'Gentle 2.5h pace with stops for artisanal ice cream.',
          why_recommended: 'Introduces children and parents to Riga’s storybook architecture.',
          sort_order: 2,
        },
        {
          journey_id: demoJourney.journey_id,
          day_number: 1,
          time_slot: 'EVENING',
          module_id: mDinner.module_id,
          custom_title: 'Candlelit Medieval Vault Feast',
          notes: 'Reserved private alcove in 13th-century stone chamber.',
          why_recommended: 'Captivating sensory dining experience with authentic medieval atmosphere.',
          sort_order: 3,
        },
        {
          journey_id: demoJourney.journey_id,
          day_number: 2,
          time_slot: 'FULL_DAY',
          module_id: mSigulda.module_id,
          custom_title: 'Gauja Valley & Turaida Medieval Castle Exploration',
          notes: 'Private chauffeured day trip into Vidzeme nature.',
          why_recommended: 'Combines fresh pine-scented nature, castle towers, and open space for children to explore.',
          sort_order: 1,
        },
        {
          journey_id: demoJourney.journey_id,
          day_number: 2,
          time_slot: 'EVENING',
          module_id: m3Pavari.module_id,
          custom_title: '3 Pavāru Modern Latvian Dinner',
          notes: 'Interactive table art sauces that delight both adults and children.',
          why_recommended: 'Premier taste of contemporary Baltic culinary movement.',
          sort_order: 2,
        },
      ],
    });
  }

  // Create approval audit entry
  await prisma.approval.create({
    data: {
      journey_id: demoJourney.journey_id,
      reviewer_name: 'EXIMIA Recommendation Engine',
      from_status: 'DRAFT',
      to_status: 'OPS_REVIEW',
      decision: 'SUBMITTED_FOR_REVIEW',
      comments: 'Questionnaire completed by customer. Submitted for Prime Assist operational validation.',
      slot_checked: false,
      pricing_checked: false,
      safety_checked: false,
    },
  });

  console.log('✅ Created Demo Customer & Journey in OPS_REVIEW status');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
