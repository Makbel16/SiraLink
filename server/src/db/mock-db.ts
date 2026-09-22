import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

export interface MockUser {
  id: string;
  phone_number: string;
  full_name: string;
  role: 'CLIENT' | 'WORKER' | 'ADMIN';
  language_preference: 'am' | 'om' | 'en';
  avatar_url: string | null;
  profile_audio_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MockWorkerProfile {
  id: string;
  user_id: string;
  skill_category: string;
  skill_description: string;
  experience_years: number;
  hourly_rate_etb: number;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
}

export interface MockOTP {
  id: string;
  phone_number: string;
  otp_code: string;
  expires_at: Date;
  is_verified: boolean;
  created_at: Date;
}

export interface MockJob {
  id: string;
  client_id: string;
  category: string;
  title: string;
  description: string;
  audio_url: string | null;
  transcription_text: string | null;
  offered_price_etb: number;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  latitude: number;
  longitude: number;
  worker_id: string | null;
  accepted_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

class InMemoryDatabase {
  users: Map<string, MockUser> = new Map();
  workerProfiles: Map<string, MockWorkerProfile> = new Map();
  otps: MockOTP[] = [];
  jobs: Map<string, MockJob> = new Map();
  ratings: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // Default client
    const clientId = 'c1000000-0000-0000-0000-000000000001';
    this.users.set(clientId, {
      id: clientId,
      phone_number: '+251911223344',
      full_name: 'Kidus Yohannes',
      role: 'CLIENT',
      language_preference: 'am',
      avatar_url: null,
      profile_audio_url: null,
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    const workers = [
      { phone: '+251921001001', name: 'Abebe Tadesse', cat: 'PLUMBING', desc: 'Expert in pipe leakage repair and drainage clearing.', exp: 8, rate: 450, rating: 4.85, count: 38, lat: 8.9984, lng: 38.7865 },
      { phone: '+251921001002', name: 'Chala Dibaba', cat: 'ELECTRICAL', desc: 'Certified electrician specializing in short-circuit diagnosis and solar setup.', exp: 6, rate: 500, rating: 4.92, count: 52, lat: 9.0125, lng: 38.7692 },
      { phone: '+251921001003', name: 'Dawit Mengistu', cat: 'CARPENTRY', desc: 'Custom furniture, door alignment, and cabinet installation.', exp: 10, rate: 600, rating: 4.70, count: 29, lat: 9.0345, lng: 38.7521 },
      { phone: '+251921001004', name: 'Almaz Belay', cat: 'PAINTING', desc: 'Interior and exterior home wall painting and finishing.', exp: 5, rate: 400, rating: 4.65, count: 19, lat: 9.0221, lng: 38.8312 },
      { phone: '+251921001005', name: 'Tigist Assefa', cat: 'CLEANING', desc: 'Deep home cleaning, move-in/move-out sanitize, and carpet washing.', exp: 4, rate: 350, rating: 4.95, count: 64, lat: 9.0178, lng: 38.8021 },
      { phone: '+251921001006', name: 'Tolossa Gemechu', cat: 'MECHANIC', desc: 'On-site vehicle diagnostic, battery jumping, and brake service.', exp: 9, rate: 550, rating: 4.88, count: 47, lat: 8.9912, lng: 38.7345 },
      { phone: '+251921001007', name: 'Bethlehem Haile', cat: 'PLUMBING', desc: 'High-rise residential and commercial plumbing specialist.', exp: 7, rate: 480, rating: 4.90, count: 41, lat: 9.0012, lng: 38.8145 },
      { phone: '+251921001008', name: 'Yonas Bekele', cat: 'ELECTRICAL', desc: 'Three-phase wiring, generator servicing, and breaker replacement.', exp: 12, rate: 650, rating: 4.78, count: 58, lat: 8.9567, lng: 38.7189 },
      { phone: '+251921001009', name: 'Meron Tefera', cat: 'PAINTING', desc: 'Texture painting, wallpaper removal, and damp-proofing.', exp: 6, rate: 420, rating: 4.82, count: 23, lat: 8.9834, lng: 38.7456 },
      { phone: '+251921001010', name: 'Getachew Worku', cat: 'CARPENTRY', desc: 'Roof timber framing, laminate flooring, and wood carving.', exp: 15, rate: 700, rating: 4.96, count: 83, lat: 9.0298, lng: 38.8654 },
      { phone: '+251921001011', name: 'Rahel Girma', cat: 'CLEANING', desc: 'Eco-friendly cleaning for residences, villas, and diplomatic compounds.', exp: 5, rate: 380, rating: 4.89, count: 35, lat: 8.9654, lng: 38.7912 }
    ];

    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];
      if (!w) continue;
      const uId = `w1000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`;
      const wpId = `p1000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`;

      this.users.set(uId, {
        id: uId,
        phone_number: w.phone,
        full_name: w.name,
        role: 'WORKER',
        language_preference: 'am',
        avatar_url: null,
        profile_audio_url: null,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      this.workerProfiles.set(wpId, {
        id: wpId,
        user_id: uId,
        skill_category: w.cat,
        skill_description: w.desc,
        experience_years: w.exp,
        hourly_rate_etb: w.rate,
        rating_avg: w.rating,
        rating_count: w.count,
        is_available: true,
        latitude: w.lat,
        longitude: w.lng,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  execute(text: string, params: any[] = []): { rows: any[]; rowCount: number } {
    const q = text.trim();

    // 1. INSERT INTO otp_verifications
    if (/INSERT\s+INTO\s+otp_verifications/i.test(q)) {
      const otpId = randomUUID();
      const otp: MockOTP = {
        id: otpId,
        phone_number: params[0],
        otp_code: params[1],
        expires_at: params[2] || new Date(Date.now() + 600000),
        is_verified: false,
        created_at: new Date()
      };
      this.otps.push(otp);
      return { rows: [{ id: otpId }], rowCount: 1 };
    }

    // 2. SELECT * FROM otp_verifications
    if (/SELECT\s+.*FROM\s+otp_verifications/i.test(q)) {
      const phone = params[0];
      const code = params[1];
      const match = this.otps
        .filter((o) => o.phone_number === phone && o.otp_code === code && !o.is_verified)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
      return { rows: match ? [match] : [], rowCount: match ? 1 : 0 };
    }

    // 3. UPDATE otp_verifications SET is_verified = TRUE
    if (/UPDATE\s+otp_verifications/i.test(q)) {
      const id = params[0];
      const otp = this.otps.find((o) => o.id === id);
      if (otp) otp.is_verified = true;
      return { rows: [], rowCount: otp ? 1 : 0 };
    }

    // 4. SELECT * FROM users WHERE phone_number = $1
    if (/SELECT\s+.*FROM\s+users\s+WHERE\s+phone_number\s*=\s*\$1/i.test(q)) {
      const phone = params[0];
      for (const u of this.users.values()) {
        if (u.phone_number === phone) return { rows: [u], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 5. SELECT * FROM users WHERE id = $1
    if (/SELECT\s+.*FROM\s+users\s+WHERE\s+id\s*=\s*\$1/i.test(q)) {
      const id = params[0];
      const u = this.users.get(id);
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }

    // 6. INSERT INTO users ... RETURNING *
    if (/INSERT\s+INTO\s+users/i.test(q)) {
      const id = randomUUID();
      const phone = params[0];
      const name = params[1];
      const role = params[2] || 'CLIENT';
      const lang = params[3] || 'am';
      const user: MockUser = {
        id,
        phone_number: phone,
        full_name: name,
        role,
        language_preference: lang,
        avatar_url: null,
        profile_audio_url: null,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.users.set(id, user);
      return { rows: [user], rowCount: 1 };
    }

    // 7. UPDATE users
    if (/UPDATE\s+users/i.test(q)) {
      const id = params[params.length - 1];
      const u = this.users.get(id);
      if (u) {
        u.updated_at = new Date();
        return { rows: [u], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 8. Nearby workers query (ST_DWithin, ST_Distance)
    if (/FROM\s+worker_profiles\s+wp\s+INNER\s+JOIN\s+users\s+u/i.test(q) && /ST_DWithin|distance_meters/i.test(q)) {
      const clientLng = parseFloat(params[0]);
      const clientLat = parseFloat(params[1]);
      const radiusMeters = parseFloat(params[2]);
      let categoryFilter = params.length > 5 ? params[3] : undefined;

      const matched: any[] = [];
      for (const wp of this.workerProfiles.values()) {
        if (!wp.is_available) continue;
        if (categoryFilter && wp.skill_category !== categoryFilter) continue;
        const u = this.users.get(wp.user_id);
        if (!u || !u.is_active) continue;

        const distanceMeters = haversineMeters(clientLat, clientLng, wp.latitude, wp.longitude);
        if (distanceMeters <= radiusMeters) {
          matched.push({
            id: wp.id,
            user_id: wp.user_id,
            full_name: u.full_name,
            phone_number: u.phone_number,
            avatar_url: u.avatar_url,
            profile_audio_url: u.profile_audio_url,
            skill_category: wp.skill_category,
            skill_description: wp.skill_description,
            experience_years: wp.experience_years,
            hourly_rate_etb: wp.hourly_rate_etb,
            rating_avg: wp.rating_avg,
            rating_count: wp.rating_count,
            is_available: wp.is_available,
            latitude: wp.latitude,
            longitude: wp.longitude,
            distance_meters: distanceMeters
          });
        }
      }

      matched.sort((a, b) => a.distance_meters - b.distance_meters);
      return { rows: matched, rowCount: matched.length };
    }

    // 9. Single worker lookup (SELECT wp.* FROM worker_profiles wp ... WHERE wp.user_id = $1 or wp.id = $1)
    if (/FROM\s+worker_profiles\s+wp\s+INNER\s+JOIN\s+users\s+u/i.test(q)) {
      const searchId = params[0];
      for (const wp of this.workerProfiles.values()) {
        if (wp.id === searchId || wp.user_id === searchId) {
          const u = this.users.get(wp.user_id);
          return {
            rows: [
              {
                ...wp,
                full_name: u?.full_name || '',
                phone_number: u?.phone_number || '',
                avatar_url: u?.avatar_url || null,
                profile_audio_url: u?.profile_audio_url || null,
                is_verified: u?.is_verified ?? true,
                latitude: wp.latitude,
                longitude: wp.longitude
              }
            ],
            rowCount: 1
          };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    // 10. Worker profile upsert
    if (/INSERT\s+INTO\s+worker_profiles/i.test(q)) {
      const userId = params[0];
      let wp = Array.from(this.workerProfiles.values()).find((p) => p.user_id === userId);
      if (!wp) {
        const wpId = randomUUID();
        wp = {
          id: wpId,
          user_id: userId,
          skill_category: params[1],
          skill_description: params[2] || '',
          experience_years: params[3] || 1,
          hourly_rate_etb: params[4] || 400,
          rating_avg: 5.0,
          rating_count: 0,
          is_available: params[5] ?? true,
          latitude: params[7] || 9.02,
          longitude: params[6] || 38.74,
          created_at: new Date(),
          updated_at: new Date()
        };
        this.workerProfiles.set(wpId, wp);
      } else {
        wp.skill_category = params[1];
        wp.skill_description = params[2] || wp.skill_description;
        wp.experience_years = params[3] || wp.experience_years;
        wp.hourly_rate_etb = params[4] || wp.hourly_rate_etb;
        wp.is_available = params[5] ?? wp.is_available;
        if (params[7] !== undefined) wp.latitude = params[7];
        if (params[6] !== undefined) wp.longitude = params[6];
        wp.updated_at = new Date();
      }
      return { rows: [wp], rowCount: 1 };
    }

    // 11. Worker location / availability updates
    if (/UPDATE\s+worker_profiles\s+SET\s+is_available/i.test(q)) {
      const isAvailable = params[0];
      const userId = params[1];
      const wp = Array.from(this.workerProfiles.values()).find((p) => p.user_id === userId);
      if (wp) {
        wp.is_available = isAvailable;
        return { rows: [wp], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 12. INSERT INTO job_requests
    if (/INSERT\s+INTO\s+job_requests/i.test(q)) {
      const jobId = randomUUID();
      const job: MockJob = {
        id: jobId,
        client_id: params[0],
        category: params[1],
        title: params[2] || 'Service Request',
        description: params[3] || '',
        audio_url: params[4] || null,
        transcription_text: params[5] || null,
        offered_price_etb: params[6] || 400,
        status: 'OPEN',
        latitude: params[7] || 9.02,
        longitude: params[8] || 38.74,
        worker_id: params[9] || null,
        accepted_at: null,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.jobs.set(jobId, job);
      return { rows: [job], rowCount: 1 };
    }

    // 13. SELECT FROM job_requests
    if (/SELECT\s+.*FROM\s+job_requests/i.test(q)) {
      const searchId = params[0];
      if (/WHERE\s+id\s*=\s*\$1/i.test(q)) {
        const j = this.jobs.get(searchId);
        return { rows: j ? [j] : [], rowCount: j ? 1 : 0 };
      }
      const list = Array.from(this.jobs.values());
      return { rows: list, rowCount: list.length };
    }

    // 14. UPDATE job_requests SET status
    if (/UPDATE\s+job_requests\s+SET\s+status/i.test(q)) {
      const newStatus = params[0];
      const jobId = params[1];
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = newStatus;
        if (newStatus === 'ASSIGNED') j.accepted_at = new Date();
        if (newStatus === 'COMPLETED') j.completed_at = new Date();
        return { rows: [j], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 15. INSERT INTO ratings
    if (/INSERT\s+INTO\s+ratings/i.test(q)) {
      const rating = {
        id: randomUUID(),
        job_id: params[0],
        client_id: params[1],
        worker_id: params[2],
        score: params[3],
        review_comment: params[4] || null,
        created_at: new Date()
      };
      this.ratings.push(rating);
      return { rows: [rating], rowCount: 1 };
    }

    // Default fallback: empty rows
    logger.warn('[InMemoryDB] Unhandled query pattern, returning empty set', { query: q });
    return { rows: [], rowCount: 0 };
  }
}

export const mockDb = new InMemoryDatabase();
