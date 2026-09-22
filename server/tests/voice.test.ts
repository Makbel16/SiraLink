import { describe, it, expect } from 'vitest';
import { VoiceService } from '../src/services/voice.service.js';

describe('VoiceService & Category Classification', () => {
  it('detects Amharic plumbing request accurately', () => {
    const text = 'ቤቴ ውስጥ የውሃ ቧንቧ ተበላሽቷል። በፍጥነት የሚመጣ ሰው እፈልጋለሁ።';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.language).toBe('am');
    expect(result.category).toBe('PLUMBING');
  });

  it('detects Amharic electrical request accurately', () => {
    const text = 'ሳሎን ውስጥ ያለው መብራት እና ቆጣሪ አጨናንቋል።';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.language).toBe('am');
    expect(result.category).toBe('ELECTRICAL');
  });

  it('detects Afaan Oromoo plumbing request accurately', () => {
    const text = 'Bishaan boollaa ujjummoon cabee dhangala’aa jira. Ogeessa hatattamaan barbaada.';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.language).toBe('om');
    expect(result.category).toBe('PLUMBING');
  });

  it('detects English carpentry request accurately', () => {
    const text = 'I need a carpenter to fix the broken wooden door and closet in the bedroom.';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.language).toBe('en');
    expect(result.category).toBe('CARPENTRY');
  });

  it('detects Amharic painting request accurately', () => {
    const text = 'የቤት ግድግዳ ቀለም መቀባት እፈልጋለሁ';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.language).toBe('am');
    expect(result.category).toBe('PAINTING');
  });

  it('detects English car mechanic request accurately', () => {
    const text = 'My car engine will not start and the battery is completely dead.';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.language).toBe('en');
    expect(result.category).toBe('MECHANIC');
  });

  it('falls back to OTHER for ambiguous general text', () => {
    const text = 'Hello, can somebody come and help me today?';
    const result = VoiceService.detectCategoryAndLanguage(text);

    expect(result.category).toBe('OTHER');
  });
});
