import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('API Health and Public Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns HTTP 200 with service info', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('siralink-api');
    expect(body.timestamp).toBeDefined();
  });

  it('POST /api/voice/transcribe without file returns 400 error response', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/voice/transcribe'
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FILE_REQUIRED');
  });

  it('POST /api/auth/request-otp with invalid phone number returns 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/request-otp',
      payload: {
        phoneNumber: '123'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
  });
});
