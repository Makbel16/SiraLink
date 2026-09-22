import { query } from '../db/index.js';
import { User, SupportedLanguage } from '../types/index.js';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE id = $1 AND is_active = TRUE;', [id]);
    return res.rows[0] || null;
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE phone_number = $1;', [phoneNumber]);
    return res.rows[0] || null;
  }

  async updateUser(
    id: string,
    updates: {
      full_name?: string;
      language_preference?: SupportedLanguage;
      avatar_url?: string;
      profile_audio_url?: string;
    }
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.full_name !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.full_name);
    }
    if (updates.language_preference !== undefined) {
      fields.push(`language_preference = $${idx++}`);
      values.push(updates.language_preference);
    }
    if (updates.avatar_url !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(updates.avatar_url);
    }
    if (updates.profile_audio_url !== undefined) {
      fields.push(`profile_audio_url = $${idx++}`);
      values.push(updates.profile_audio_url);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const res = await query(sql, values);
    return res.rows[0] || null;
  }
}

export const userRepository = new UserRepository();
