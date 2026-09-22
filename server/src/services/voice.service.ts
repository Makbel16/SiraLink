import { env } from '../config/env.js';
import { JobCategory, SupportedLanguage } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface TranscriptionResult {
  text: string;
  detectedLanguage: SupportedLanguage;
  category: JobCategory;
  confidence: number;
}

export interface SpeechToTextService {
  transcribe(audioBuffer: Buffer, filename: string, mimetype: string): Promise<TranscriptionResult>;
}

export class WhisperSpeechToTextService implements SpeechToTextService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBuffer: Buffer, filename: string, mimetype: string): Promise<TranscriptionResult> {
    try {
      logger.info('Calling OpenAI Whisper API for speech transcription', { filename, mimetype });

      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: mimetype });
      formData.append('file', blob, filename);
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI Whisper error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as { text: string };
      const transcript = data.text || '';
      logger.info('Received transcript from Whisper', { length: transcript.length });

      const detected = VoiceService.detectCategoryAndLanguage(transcript);

      return {
        text: transcript,
        detectedLanguage: detected.language,
        category: detected.category,
        confidence: 0.95
      };
    } catch (error) {
      logger.error('Failed to transcribe with Whisper', error);
      throw error;
    }
  }
}

export class MockSpeechToTextService implements SpeechToTextService {
  async transcribe(audioBuffer: Buffer, filename: string, mimetype: string): Promise<TranscriptionResult> {
    logger.info('Using Mock Speech-to-Text Provider (Dev mode)', { filename, size: audioBuffer.length });

    // Simulate realistic Amharic plumbing request for local development
    const mockTranscripts = [
      {
        text: 'ቤቴ ውስጥ የውሃ ቧንቧ ተበላሽቷል። በፍጥነት የሚመጣ ቧንቧ ሠራተኛ እፈልጋለሁ።',
        language: 'am' as SupportedLanguage,
        category: 'PLUMBING' as JobCategory
      },
      {
        text: 'ሳሎን ውስጥ ያለው መብራት እና ቆጣሪ አጨናንቋል። ኤሌክትሪክ ሰራተኛ እፈልጋለሁ።',
        language: 'am' as SupportedLanguage,
        category: 'ELECTRICAL' as JobCategory
      },
      {
        text: 'Bishaan boollaa ujjummoon cabee dhangala’aa jira. Ogeessa hatattamaan barbaada.',
        language: 'om' as SupportedLanguage,
        category: 'PLUMBING' as JobCategory
      },
      {
        text: 'The water pipes under my kitchen sink are leaking heavily. I need an urgent plumber.',
        language: 'en' as SupportedLanguage,
        category: 'PLUMBING' as JobCategory
      }
    ];

    // Pick first or random based on buffer length
    const sample = mockTranscripts[audioBuffer.length % mockTranscripts.length]!;

    return {
      text: sample.text,
      detectedLanguage: sample.language,
      category: sample.category,
      confidence: 0.9
    };
  }
}

export class VoiceService {
  private sttProvider: SpeechToTextService;

  constructor() {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
      this.sttProvider = new WhisperSpeechToTextService(env.OPENAI_API_KEY);
    } else {
      this.sttProvider = new MockSpeechToTextService();
    }
  }

  async processVoiceDescription(
    audioBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<TranscriptionResult> {
    // Validate file format
    const validMimes = [
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
      'audio/aac',
      'audio/wav',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/webm',
      'audio/ogg'
    ];

    const isExtensionValid = /\.(m4a|mp4|aac|wav|mp3|webm|ogg)$/i.test(filename);
    if (!validMimes.includes(mimetype.toLowerCase()) && !isExtensionValid) {
      throw new Error(`Unsupported audio format: ${mimetype}. Please upload m4a, wav, or mp3.`);
    }

    // Limit audio size to 25MB
    const maxSize = 25 * 1024 * 1024;
    if (audioBuffer.length > maxSize) {
      throw new Error('Audio file exceeds maximum allowed limit of 25MB');
    }

    return this.sttProvider.transcribe(audioBuffer, filename, mimetype);
  }

  /**
   * Identifies service category and spoken language from transcribed text
   * in Amharic, Afaan Oromoo, or English.
   */
  static detectCategoryAndLanguage(text: string): { category: JobCategory; language: SupportedLanguage } {
    const lower = text.toLowerCase();

    // Check language
    let language: SupportedLanguage = 'en';
    const amharicRegex = /[\u1200-\u137F]/;
    if (amharicRegex.test(text)) {
      language = 'am';
    } else if (
      /\b(bishaan|barbaada|dhangala|mana|boollaa|ogeessa|ibsaa|balbala|hojii|akka|jira)\b/i.test(lower)
    ) {
      language = 'om';
    }

    // Category keyword matching
    // PLUMBING
    if (
      lower.includes('ቧንቧ') ||
      lower.includes('ውሃ') ||
      lower.includes('ፍሳሽ') ||
      lower.includes('plumb') ||
      lower.includes('pipe') ||
      lower.includes('leak') ||
      lower.includes('drain') ||
      lower.includes('sink') ||
      lower.includes('faucet') ||
      lower.includes('bishaan') ||
      lower.includes('ujjummoo') ||
      lower.includes('boollaa')
    ) {
      return { category: 'PLUMBING', language };
    }

    // ELECTRICAL
    if (
      lower.includes('መብራት') ||
      lower.includes('ኤሌክትሪክ') ||
      lower.includes('ቆጣሪ') ||
      lower.includes('ፊውዝ') ||
      lower.includes('ሽቦ') ||
      lower.includes('electr') ||
      lower.includes('light') ||
      lower.includes('wire') ||
      lower.includes('power') ||
      lower.includes('breaker') ||
      lower.includes('ibsaa') ||
      lower.includes('humna')
    ) {
      return { category: 'ELECTRICAL', language };
    }

    // CARPENTRY
    if (
      lower.includes('አናጺ') ||
      lower.includes('እንጨት') ||
      lower.includes('በር') ||
      lower.includes('ቁምሳጥን') ||
      lower.includes('አልጋ') ||
      lower.includes('ጠረጴዛ') ||
      lower.includes('carpenter') ||
      lower.includes('wood') ||
      lower.includes('door') ||
      lower.includes('furniture') ||
      lower.includes('closet') ||
      lower.includes('mukaa') ||
      lower.includes('balbala')
    ) {
      return { category: 'CARPENTRY', language };
    }

    // PAINTING
    if (
      lower.includes('ቀለም') ||
      lower.includes('ግድግዳ') ||
      lower.includes('ማቅለም') ||
      lower.includes('paint') ||
      lower.includes('wall') ||
      lower.includes('halluu')
    ) {
      return { category: 'PAINTING', language };
    }

    // CLEANING
    if (
      lower.includes('ጽዳት') ||
      lower.includes('እጥበት') ||
      lower.includes('ማጠብ') ||
      lower.includes('ማጽዳት') ||
      lower.includes('clean') ||
      lower.includes('wash') ||
      lower.includes('carpet') ||
      lower.includes('qulqullina')
    ) {
      return { category: 'CLEANING', language };
    }

    // MECHANIC
    if (
      lower.includes('መኪና') ||
      lower.includes('ሞተር') ||
      lower.includes('ፍሬን') ||
      lower.includes('ባትሪ') ||
      lower.includes('mechanic') ||
      lower.includes('car') ||
      lower.includes('engine') ||
      lower.includes('auto') ||
      lower.includes('konkolaataa') ||
      lower.includes('motora')
    ) {
      return { category: 'MECHANIC', language };
    }

    // CONSTRUCTION
    if (
      lower.includes('ግንባታ') ||
      lower.includes('ሜሶን') ||
      lower.includes('ስሚንቶ') ||
      lower.includes('ጡብ') ||
      lower.includes('construction') ||
      lower.includes('mason') ||
      lower.includes('cement') ||
      lower.includes('brick') ||
      lower.includes('ijaarsa')
    ) {
      return { category: 'CONSTRUCTION', language };
    }

    // MOVING
    if (
      lower.includes('ማጓጓዝ') ||
      lower.includes('ማዛወር') ||
      lower.includes('እቃ') ||
      lower.includes('mov') ||
      lower.includes('pack') ||
      lower.includes('transport') ||
      lower.includes('fe\'iisa')
    ) {
      return { category: 'MOVING', language };
    }

    // GARDENING
    if (
      lower.includes('አትክልት') ||
      lower.includes('ሳር') ||
      lower.includes('ዛፍ') ||
      lower.includes('garden') ||
      lower.includes('grass') ||
      lower.includes('tree') ||
      lower.includes('lawn') ||
      lower.includes('biqiltuu')
    ) {
      return { category: 'GARDENING', language };
    }

    return { category: 'OTHER', language };
  }
}

export const voiceService = new VoiceService();
