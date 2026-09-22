export type UserRole = 'WORKER' | 'CLIENT' | 'ADMIN';

export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type JobCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'CARPENTRY'
  | 'PAINTING'
  | 'CLEANING'
  | 'MECHANIC'
  | 'CONSTRUCTION'
  | 'MOVING'
  | 'GARDENING'
  | 'OTHER';

export type SupportedLanguage = 'am' | 'om' | 'en';

export interface User {
  id: string;
  phone_number: string;
  full_name: string | null;
  role: UserRole;
  language_preference: SupportedLanguage;
  profile_audio_url: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  skill_category: JobCategory;
  skill_description: string | null;
  experience_years: number;
  hourly_rate_etb: number | null;
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
  current_location?: {
    latitude: number;
    longitude: number;
  } | null;
  location_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NearbyWorkerResult {
  id: string;
  user_id: string;
  full_name: string | null;
  phone_number: string;
  avatar_url: string | null;
  profile_audio_url: string | null;
  skill_category: JobCategory;
  skill_description: string | null;
  experience_years: number;
  hourly_rate_etb: number | null;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
  distance_meters: number;
  distance_km: number;
}

export interface JobRequest {
  id: string;
  client_id: string;
  worker_id: string | null;
  category: JobCategory;
  title: string | null;
  audio_description_url: string | null;
  text_description: string | null;
  status: JobStatus;
  offered_price_etb: number | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  client_name?: string | null;
  client_phone?: string | null;
  worker_name?: string | null;
  worker_phone?: string | null;
}

export interface Rating {
  id: string;
  job_id: string;
  client_id: string;
  worker_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client_name?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  language: SupportedLanguage;
}
