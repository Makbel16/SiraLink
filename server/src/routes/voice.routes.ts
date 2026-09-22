import { FastifyInstance } from 'fastify';
import { voiceController } from '../controllers/voice.controller.js';

export async function voiceRoutes(fastify: FastifyInstance) {
  fastify.post('/transcribe', voiceController.transcribeAudio.bind(voiceController));
}
