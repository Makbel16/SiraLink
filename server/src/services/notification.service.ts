import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';

export interface PushNotificationPayload {
  toUserId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Register or update user device push token
   */
  async registerDeviceToken(userId: string, token: string, platform?: string): Promise<void> {
    await query(`
      INSERT INTO device_tokens (user_id, token, platform)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING;
    `, [userId, token, platform || 'expo']);
    logger.info('Registered device push token', { userId, platform });
  }

  /**
   * Send notification to all registered devices of a user
   */
  async sendNotification(payload: PushNotificationPayload): Promise<void> {
    const { toUserId, title, body, data } = payload;
    try {
      const tokensRes = await query(`
        SELECT token FROM device_tokens WHERE user_id = $1;
      `, [toUserId]);

      if (tokensRes.rowCount === 0) {
        logger.info('No device token found for user notification; skipping push', { toUserId, title });
        return;
      }

      const tokens = tokensRes.rows.map(r => r.token);
      logger.info(`Sending push notification to user ${toUserId}`, { title, body, tokenCount: tokens.length });

      // Expo Push Notification API payload format
      const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {}
      }));

      // Deliver via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messages)
      });

      if (!response.ok) {
        logger.warn('Expo push notification server responded with error', { status: response.status });
      }
    } catch (err) {
      logger.error('Failed to send push notification', err, { toUserId });
      // Non-blocking failure
    }
  }
}

export const notificationService = new NotificationService();
