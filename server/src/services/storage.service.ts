import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface UploadOptions {
  buffer: Buffer;
  mimetype: string;
  originalName: string;
  folder?: string;
}

export interface StorageService {
  upload(options: UploadOptions): Promise<string>;
  delete(fileUrl: string): Promise<void>;
  getPublicUrl(filename: string): string;
}

export class LocalDiskStorageService implements StorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.resolve(env.UPLOAD_DIR);
    this.baseUrl = env.PUBLIC_STORAGE_BASE_URL.replace(/\/$/, '');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(options: UploadOptions): Promise<string> {
    const ext = path.extname(options.originalName) || '.m4a';
    const uniqueId = crypto.randomUUID();
    const subfolder = options.folder ? `${options.folder}/` : '';
    const filename = `${subfolder}${uniqueId}${ext}`;
    const targetPath = path.join(this.uploadDir, filename);

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(targetPath, options.buffer);
    logger.info('File saved locally', { filename, size: options.buffer.length });

    return `${this.baseUrl}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const filename = fileUrl.replace(`${this.baseUrl}/`, '');
      const targetPath = path.join(this.uploadDir, filename);
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
        logger.info('File deleted locally', { filename });
      }
    } catch (error) {
      logger.warn('Failed to delete local file', { fileUrl, error });
    }
  }

  getPublicUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}

export class S3CompatibleStorageService implements StorageService {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    this.bucket = env.UPLOAD_BUCKET || 'siralink-media';
    this.publicBaseUrl = env.PUBLIC_STORAGE_BASE_URL || `https://${this.bucket}.s3.amazonaws.com`;

    const clientConfig: any = {
      region: env.UPLOAD_REGION || 'auto',
      credentials: {
        accessKeyId: env.UPLOAD_ACCESS_KEY || '',
        secretAccessKey: env.UPLOAD_SECRET_KEY || ''
      }
    };

    if (env.UPLOAD_ENDPOINT) {
      clientConfig.endpoint = env.UPLOAD_ENDPOINT;
      clientConfig.forcePathStyle = true;
    }

    this.client = new S3Client(clientConfig);
  }

  async upload(options: UploadOptions): Promise<string> {
    const ext = path.extname(options.originalName) || '.m4a';
    const uniqueId = crypto.randomUUID();
    const folder = options.folder ? `${options.folder}/` : '';
    const key = `${folder}${uniqueId}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: options.buffer,
      ContentType: options.mimetype
    });

    await this.client.send(command);
    logger.info('File uploaded to object storage', { key, bucket: this.bucket });

    return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const key = fileUrl.replace(`${this.publicBaseUrl.replace(/\/$/, '')}/`, '');
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      await this.client.send(command);
      logger.info('File deleted from object storage', { key });
    } catch (error) {
      logger.warn('Failed to delete S3 file', { fileUrl, error });
    }
  }

  getPublicUrl(filename: string): string {
    return `${this.publicBaseUrl.replace(/\/$/, '')}/${filename}`;
  }
}

export const storageService: StorageService =
  env.UPLOAD_PROVIDER === 's3' && env.UPLOAD_ACCESS_KEY
    ? new S3CompatibleStorageService()
    : new LocalDiskStorageService();
