import { ApiResponse, ApiErrorResponse } from '../types/index.js';

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

export function errorResponse(code: string, message: string, details?: unknown): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
}
