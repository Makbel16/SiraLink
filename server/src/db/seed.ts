import { pool, query } from './index.js';
import { logger } from '../utils/logger.js';

export async function seedDatabase() {
  logger.info('Starting database seeding...');

  // 1. Create Sample Client
  const clientRes = await query(`
    INSERT INTO users (phone_number, full_name, role, language_preference, is_verified, is_active)
    VALUES ('+251911223344', 'Kidus Yohannes', 'CLIENT', 'am', TRUE, TRUE)
    ON CONFLICT (phone_number) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id;
  `);
  const clientId = clientRes.rows[0].id;
  logger.info(`Client created/updated with ID: ${clientId}`);

  // 2. Create Sample Admin
  await query(`
    INSERT INTO users (phone_number, full_name, role, language_preference, is_verified, is_active)
    VALUES ('+251900000001', 'SiraLink Admin', 'ADMIN', 'en', TRUE, TRUE)
    ON CONFLICT (phone_number) DO UPDATE SET role = 'ADMIN'
    RETURNING id;
  `);

  // 3. Worker seed data across Addis Ababa neighborhoods
  const workersData = [
    {
      phone: '+251921001001',
      name: 'Abebe Tadesse',
      category: 'PLUMBING',
      desc: 'Expert in pipe leakage repair, water heater installation, and drainage clearing with 8 years experience in Addis Ababa.',
      exp: 8,
      rate: 450.0,
      available: true,
      rating: 4.85,
      ratingCount: 38,
      lat: 8.9984, // Bole
      lng: 38.7865,
      lang: 'am'
    },
    {
      phone: '+251921001002',
      name: 'Chala Dibaba',
      category: 'ELECTRICAL',
      desc: 'Certified electrician specializing in short-circuit diagnosis, fuse box repairs, and solar inverter setup.',
      exp: 6,
      rate: 500.0,
      available: true,
      rating: 4.92,
      ratingCount: 52,
      lat: 9.0125, // Kazanchis
      lng: 38.7692,
      lang: 'om'
    },
    {
      phone: '+251921001003',
      name: 'Dawit Mengistu',
      category: 'CARPENTRY',
      desc: 'Custom furniture, door alignment, wooden kitchen cabinet installation, and lock repairs.',
      exp: 10,
      rate: 600.0,
      available: true,
      rating: 4.70,
      ratingCount: 29,
      lat: 9.0345, // Piassa
      lng: 38.7521,
      lang: 'am'
    },
    {
      phone: '+251921001004',
      name: 'Almaz Belay',
      category: 'PAINTING',
      desc: 'Interior and exterior home wall painting, moisture sealing, and decorative finishing.',
      exp: 5,
      rate: 400.0,
      available: true,
      rating: 4.65,
      ratingCount: 19,
      lat: 9.0221, // CMC
      lng: 38.8312,
      lang: 'am'
    },
    {
      phone: '+251921001005',
      name: 'Tigist Assefa',
      category: 'CLEANING',
      desc: 'Deep home cleaning, move-in/move-out sanitize, carpet washing, and post-construction scrubbing.',
      exp: 4,
      rate: 350.0,
      available: true,
      rating: 4.95,
      ratingCount: 64,
      lat: 9.0178, // Megenagna
      lng: 38.8021,
      lang: 'am'
    },
    {
      phone: '+251921001006',
      name: 'Tolossa Gemechu',
      category: 'MECHANIC',
      desc: 'On-site auto mechanic for battery jumpstart, brake changes, engine troubleshooting, and alternator repair.',
      exp: 9,
      rate: 750.0,
      available: true,
      rating: 4.80,
      ratingCount: 41,
      lat: 8.9723, // Saris
      lng: 38.7612,
      lang: 'om'
    },
    {
      phone: '+251921001007',
      name: 'Kassahun Bekele',
      category: 'CONSTRUCTION',
      desc: 'Masonry, tile laying, wall plastering, cement compounding, and floor leveling.',
      exp: 12,
      rate: 550.0,
      available: true,
      rating: 4.60,
      ratingCount: 22,
      lat: 9.0098, // Mexico
      lng: 38.7423,
      lang: 'am'
    },
    {
      phone: '+251921001008',
      name: 'Hailemariam Worku',
      category: 'MOVING',
      desc: 'House and office moving assistance with careful heavy furniture handling and packing.',
      exp: 3,
      rate: 400.0,
      available: true,
      rating: 4.50,
      ratingCount: 15,
      lat: 8.9882, // Gerji
      lng: 38.8145,
      lang: 'en'
    },
    {
      phone: '+251921001009',
      name: 'Girma Wolde',
      category: 'GARDENING',
      desc: 'Lawn trimming, ornamental plant care, tree pruning, compound flower landscaping, and weed removal.',
      exp: 7,
      rate: 300.0,
      available: false, // Intentionally unavailable for testing filter
      rating: 4.40,
      ratingCount: 11,
      lat: 9.0412, // Gullele
      lng: 38.7314,
      lang: 'am'
    },
    {
      phone: '+251921001010',
      name: 'Fikadu Negash',
      category: 'OTHER',
      desc: 'General handyman for fixture hanging, curtain rod setup, appliance setup, and miscellaneous repairs.',
      exp: 5,
      rate: 350.0,
      available: true,
      rating: 4.75,
      ratingCount: 33,
      lat: 9.0112, // Bole Atlas
      lng: 38.7789,
      lang: 'am'
    },
    {
      phone: '+251921001011',
      name: 'Ayana Gudeta',
      category: 'PLUMBING',
      desc: 'Water tank installation, booster pump repairs, and underground leak detection.',
      exp: 11,
      rate: 500.0,
      available: true,
      rating: 4.90,
      ratingCount: 47,
      lat: 9.0205, // Kasanchis / Kazanchis
      lng: 38.7654,
      lang: 'om'
    }
  ];

  const createdWorkerIds: string[] = [];

  for (const w of workersData) {
    const userRes = await query(`
      INSERT INTO users (phone_number, full_name, role, language_preference, is_verified, is_active)
      VALUES ($1, $2, 'WORKER', $3, TRUE, TRUE)
      ON CONFLICT (phone_number) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id;
    `, [w.phone, w.name, w.lang]);

    const workerUserId = userRes.rows[0].id;
    createdWorkerIds.push(workerUserId);

    await query(`
      INSERT INTO worker_profiles (
        user_id, skill_category, skill_description, experience_years,
        hourly_rate_etb, is_available, rating_avg, rating_count,
        current_location, location_updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) DO UPDATE SET
        skill_category = EXCLUDED.skill_category,
        skill_description = EXCLUDED.skill_description,
        hourly_rate_etb = EXCLUDED.hourly_rate_etb,
        is_available = EXCLUDED.is_available,
        rating_avg = EXCLUDED.rating_avg,
        rating_count = EXCLUDED.rating_count,
        current_location = EXCLUDED.current_location,
        location_updated_at = CURRENT_TIMESTAMP;
    `, [
      workerUserId,
      w.category,
      w.desc,
      w.exp,
      w.rate,
      w.available,
      w.rating,
      w.ratingCount,
      w.lng, // ST_MakePoint(lng, lat)
      w.lat
    ]);
  }
  logger.info(`Seeded ${workersData.length} workers successfully.`);

  // 4. Sample Job Request in Bole
  const sampleJobRes = await query(`
    INSERT INTO job_requests (
      client_id, worker_id, category, title, text_description,
      status, offered_price_etb, job_location
    )
    VALUES (
      $1, $2, 'PLUMBING', 'Kitchen sink leakage repair',
      'The drainage pipe beneath the kitchen sink has ruptured and water is leaking continuously.',
      'ASSIGNED', 450.00,
      ST_SetSRID(ST_MakePoint(38.7845, 8.9950), 4326)::geography
    )
    RETURNING id;
  `, [clientId, createdWorkerIds[0]]);
  const sampleJobId = sampleJobRes.rows[0].id;
  logger.info(`Seeded sample job with ID: ${sampleJobId}`);

  // 5. Sample Completed Job and Rating
  const completedJobRes = await query(`
    INSERT INTO job_requests (
      client_id, worker_id, category, title, text_description,
      status, offered_price_etb, job_location
    )
    VALUES (
      $1, $2, 'ELECTRICAL', 'Breaker tripping repair',
      'Circuit breaker trips every time oven is turned on.',
      'COMPLETED', 500.00,
      ST_SetSRID(ST_MakePoint(38.7690, 9.0120), 4326)::geography
    )
    RETURNING id;
  `, [clientId, createdWorkerIds[1]]);
  const completedJobId = completedJobRes.rows[0].id;

  await query(`
    INSERT INTO ratings (job_id, client_id, worker_id, rating, comment)
    VALUES ($1, $2, $3, 5, 'Chala arrived within 25 minutes and quickly diagnosed the faulty wiring. Great work!')
    ON CONFLICT (job_id, client_id) DO NOTHING;
  `, [completedJobId, clientId, createdWorkerIds[1]]);
  logger.info(`Seeded completed job and 5-star rating.`);

  logger.info('Database seeding completed successfully.');
}

if (process.argv[1] === import.meta.url || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      logger.info('Seed script finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed script failed with error', err);
      process.exit(1);
    });
}
