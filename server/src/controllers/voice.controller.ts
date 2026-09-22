import { FastifyRequest, FastifyReply } from 'fastify';
import { voiceService } from '../services/voice.service.js';
import { storageService } from '../services/storage.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export class VoiceController {
  async transcribeAudio(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.isMultipart()) {
        return reply.status(400).send(errorResponse('FILE_REQUIRED', 'Multipart audio file is required'));
      }

      const data = await request.file();
      if (!data) {
        return reply.status(400).send(errorResponse('FILE_REQUIRED', 'Audio file is required'));
      }

      const buffer = await data.toBuffer();
      const filename = data.filename || 'voice-record.m4a';
      const mimetype = data.mimetype || 'audio/m4a';

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
