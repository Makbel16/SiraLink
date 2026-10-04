import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  User,
  WorkerProfile,
  NearbyWorker,
  JobRequest,
  JobCategory,
  JobStatus,
  TranscriptionResult
} from '../types/index';

const TOKEN_KEY = 'siralink_auth_token';

// Determine API base URL based on platform and environment
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // Auto-detect development server host from Expo Constants (works with both local Wi-Fi and Tunnel)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    if (hostUri.includes('.exp.direct')) {
      return `https://${hostUri}`;
    }
    return `http://${hostUri}`;
  }
  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

// Helper to resolve media URLs to the active development or production host
export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('file://') || url.startsWith('content://')) return url;
  const baseUrl = getBaseUrl();
  const idx = url.indexOf('/uploads/');
  if (idx !== -1) {
    return `${baseUrl}${url.substring(idx)}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const BASE_URL = getBaseUrl();

// Safe storage wrapper (SecureStore for native, AsyncStorage for web)
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (err) {
      console.warn('Failed to persist auth token', err);
    }
  },
  async remove(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (err) {
      console.warn('Failed to clear auth token', err);
    }
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStorage.get();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isFormData =
    options.body instanceof FormData ||
    (options.body && typeof options.body === 'object' && '_parts' in (options.body as any));

  if (isFormData) {
    delete headers['Content-Type'];
  } else if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      const message = json?.error?.message || `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return json.data;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error('Unable to connect to SiraLink server. Check your connection.');
    }
    throw error;
  }
}

export const api = {
  // Auth
  async requestOTP(phoneNumber: string): Promise<{ success: boolean; devOtp?: string }> {
    return request('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber })
    });
  },

  async verifyOTP(params: {
    phoneNumber: string;
    otpCode: string;
    role?: 'CLIENT' | 'WORKER';
    fullName?: string;
    language?: string;
  }): Promise<{ token: string; user: User; workerProfile?: WorkerProfile | null }> {
    const data = await request<{ token: string; user: User; workerProfile?: WorkerProfile | null }>(
      '/api/auth/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
    if (data.token) {
      await tokenStorage.set(data.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: User; workerProfile?: WorkerProfile | null }> {
    return request('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      await tokenStorage.remove();
    }
  },

  // Workers
  async getNearbyWorkers(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    category?: JobCategory;
  }): Promise<NearbyWorker[]> {
    const query = new URLSearchParams();
    query.append('latitude', params.latitude.toString());
    query.append('longitude', params.longitude.toString());
    if (params.radiusKm) query.append('radiusKm', params.radiusKm.toString());
    if (params.category) query.append('category', params.category);

    return request(`/api/workers/nearby?${query.toString()}`);
  },

  async getWorker(id: string): Promise<NearbyWorker> {
    return request(`/api/workers/${id}`);
  },

  async updateWorkerLocation(latitude: number, longitude: number): Promise<void> {
    return request('/api/workers/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
  },

  async updateWorkerAvailability(isAvailable: boolean): Promise<{ isAvailable: boolean }> {
    return request('/api/workers/availability', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable })
    });
  },

  async upsertWorkerProfile(data: {
    skillCategory: JobCategory;
    skillDescription?: string;
    experienceYears?: number;
    hourlyRateEtb?: number;
    isAvailable?: boolean;
  }): Promise<WorkerProfile> {
    return request('/api/workers/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Voice
  async uploadAndTranscribe(
    fileUri: string,
    filename = 'voice.m4a',
    mimetype = 'audio/m4a'
  ): Promise<TranscriptionResult> {
    // 1. Web environment: read blob as base64 and POST standard JSON
    if (Platform.OS === 'web') {
      try {
        const blobRes = await fetch(fileUri);
        const blob = await blobRes.blob();
        const base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = (reader.result as string) || '';
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64 || '');
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const res = await request<TranscriptionResult>('/api/voice/transcribe', {
          method: 'POST',
          body: JSON.stringify({
            audioBase64: base64Audio,
            filename,
            mimetype
          })
        });
        if (res && res.audioUrl) {
          res.audioUrl = resolveMediaUrl(res.audioUrl);
        }
        return res;
      } catch (webErr) {
        console.warn('Web base64 transcription error:', webErr);
      }
    }

    // 2. Native Mobile (Android & iOS):
    // In React Native 0.86, appending a plain JS object { uri, name, type } to FormData causes:
    // [Error: Unsupported FormDataPart implementation].
    // Strategy A: Read audio file directly as base64 string and POST as standard JSON.
    // This completely eliminates FormDataPart and multipart boundary issues.
    try {
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const res = await request<TranscriptionResult>('/api/voice/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          audioBase64: base64Audio,
          filename,
          mimetype
        })
      });
      if (res && res.audioUrl) {
        res.audioUrl = resolveMediaUrl(res.audioUrl);
      }
      return res;
    } catch (fsErr) {
      console.warn('Base64 read error, trying native FileSystem.uploadAsync', fsErr);

      // Strategy B: Native FileSystem.uploadAsync (streaming native multipart without JS FormData)
      const token = await tokenStorage.get();
      const url = `${BASE_URL}/api/voice/transcribe`;

      const uploadResult = await FileSystem.uploadAsync(url, fileUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType: mimetype,
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        const json = JSON.parse(uploadResult.body);
        if (json.success && json.data) {
          const data = json.data as TranscriptionResult;
          if (data && data.audioUrl) {
            data.audioUrl = resolveMediaUrl(data.audioUrl);
          }
          return data;
        }
      }
      throw new Error(`Upload failed with status ${uploadResult.status}`);
    }
  },

  // Jobs
  async createJob(data: {
    category: JobCategory;
    title?: string;
    audioDescriptionUrl?: string;
    textDescription?: string;
    offeredPriceEtb?: number;
    latitude: number;
    longitude: number;
    workerId?: string;
  }): Promise<JobRequest> {
    return request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getJobs(status?: JobStatus): Promise<JobRequest[]> {
    const q = status ? `?status=${status}` : '';
    return request(`/api/jobs${q}`);
  },

  async getJobById(id: string): Promise<JobRequest> {
    return request(`/api/jobs/${id}`);
  },

  async updateJobStatus(id: string, status: JobStatus, workerId?: string): Promise<JobRequest> {
    return request(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, workerId })
    });
  },

  async completeJob(id: string): Promise<JobRequest> {
    return request(`/api/jobs/${id}/complete`, {
      method: 'POST'
    });
  },

  // Ratings
  async submitRating(jobId: string, rating: number, comment?: string): Promise<any> {
    return request('/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ jobId, rating, comment })
    });
  },

  async getWorkerRatings(workerId: string): Promise<any[]> {
    return request(`/api/ratings/workers/${workerId}`);
  },

  // Notifications
  async registerDeviceToken(token: string): Promise<void> {
    return request('/api/notifications/device-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform: Platform.OS })
    });
  },

  // Helpers
  resolveMediaUrl,
  getBaseUrl
};
