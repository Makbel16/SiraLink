import { FastifyRequest, FastifyReply } from 'fastify';
import { voiceService } from '../services/voice.service.js';
import { storageService } from '../services/storage.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export class VoiceController {
  async transcribeAudio(request: FastifyRequest, reply: FastifyReply) {
    try {
      let buffer: Buffer;
      let filename = 'voice-record.m4a';
      let mimetype = 'audio/m4a';

      if (request.isMultipart()) {
        const data = await request.file();
        if (!data) {
          return reply.status(400).send(errorResponse('FILE_REQUIRED', 'Audio file is required'));
        }
        buffer = await data.toBuffer();
        filename = data.filename || filename;
        mimetype = data.mimetype || mimetype;
      } else {
        const body = request.body as any;
        if (!body || !body.audioBase64) {
          return reply.status(400).send(errorResponse('FILE_REQUIRED', 'Audio file or base64 audio is required'));
        }
        buffer = Buffer.from(body.audioBase64, 'base64');
        filename = body.filename || filename;
        mimetype = body.mimetype || mimetype;
      }

      if (buffer.length === 0) {
        return reply.status(400).send(errorResponse('FILE_EMPTY', 'Uploaded audio file is empty'));
      }

      logger.info('Processing uploaded voice file', {
        filename,
        mimetype,
        sizeBytes: buffer.length
      });

      // 1. Transcribe voice audio
      const result = await voiceService.processVoiceDescription(buffer, filename, mimetype);

      // 2. Persist audio file to storage service (local or S3)
      const audioUrl = await storageService.upload({
        buffer,
        originalName: filename,
        mimetype,
        folder: 'audio'
      });

      return reply.send(
        successResponse({
          audioUrl,
          transcript: result.text,
          detectedLanguage: result.detectedLanguage,
          category: result.category,
          confidence: result.confidence
        })
      );
    } catch (error: any) {
      logger.error('Audio transcription processing failure', error);
      return reply.status(422).send(
        errorResponse(
          'TRANSCRIPTION_FAILED',
          error.message || 'Voice transcription failed. You can retry or enter details manually.'
        )
      );
    }
  }
}

export const voiceController = new VoiceController();
