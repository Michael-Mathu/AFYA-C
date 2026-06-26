import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  private readonly config: Record<string, any>;

  constructor(private nestConfigService: NestConfigService) {
    this.config = {
      app: {
        name: nestConfigService.get('APP_NAME', 'AFYA-C'),
        env: nestConfigService.get('NODE_ENV', 'development'),
        port: parseInt(nestConfigService.get('PORT', '3000'), 10),
        apiPrefix: nestConfigService.get('API_PREFIX', 'api'),
      },
      database: {
        url: nestConfigService.get('DATABASE_URL'),
        host: nestConfigService.get('DB_HOST', 'localhost'),
        port: parseInt(nestConfigService.get('DB_PORT', '5432'), 10),
        username: nestConfigService.get('DB_USERNAME', 'postgres'),
        password: nestConfigService.get('DB_PASSWORD', 'password'),
        name: nestConfigService.get('DB_NAME', 'afya_c'),
      },
      redis: {
        url: nestConfigService.get('REDIS_URL', 'redis://localhost:6379'),
        host: nestConfigService.get('REDIS_HOST', 'localhost'),
        port: parseInt(nestConfigService.get('REDIS_PORT', '6379'), 10),
      },
      jwt: {
        secret: nestConfigService.get('JWT_SECRET', 'afya-c-secret-key'),
        expiry: nestConfigService.get('JWT_EXPIRY', '15m'),
        refreshExpiry: nestConfigService.get('JWT_REFRESH_EXPIRY', '7d'),
      },
      mpesa: {
        consumerKey: nestConfigService.get('MPESA_CONSUMER_KEY'),
        consumerSecret: nestConfigService.get('MPESA_CONSUMER_SECRET'),
        passkey: nestConfigService.get('MPESA_PASSKEY'),
        shortcode: nestConfigService.get('MPESA_SHORTCODE'),
        environment: nestConfigService.get('MPESA_ENVIRONMENT', 'sandbox'),
        callbackUrl: nestConfigService.get('MPESA_CALLBACK_URL'),
      },
      ai: {
        openaiApiKey: nestConfigService.get('OPENAI_API_KEY'),
        anthropicApiKey: nestConfigService.get('ANTHROPIC_API_KEY'),
        provider: nestConfigService.get('AI_PROVIDER', 'openai'),
        model: nestConfigService.get('AI_MODEL', 'gpt-4o-mini'),
      },
      minio: {
        endpoint: nestConfigService.get('MINIO_ENDPOINT', 'localhost:9000'),
        accessKey: nestConfigService.get('MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: nestConfigService.get('MINIO_SECRET_KEY', 'minioadmin'),
        bucket: nestConfigService.get('MINIO_BUCKET', 'afya-c-documents'),
      },
      email: {
        host: nestConfigService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(nestConfigService.get('SMTP_PORT', '587'), 10),
        secure: nestConfigService.get('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: nestConfigService.get('SMTP_USER'),
          pass: nestConfigService.get('SMTP_PASS'),
        },
        from: nestConfigService.get('EMAIL_FROM', 'noreply@afya-c.com'),
      },
      kra: {
        pin: nestConfigService.get('KRA_PIN'),
        vatRate: parseFloat(nestConfigService.get('VAT_RATE', '0.16')),
      },
      app: {
        timezone: nestConfigService.get('TZ', 'Africa/Nairobi'),
        currency: nestConfigService.get('CURRENCY_CODE', 'KES'),
        locale: nestConfigService.get('LOCALE', 'en'),
      },
      security: {
        rateLimitWindow: parseInt(nestConfigService.get('RATE_LIMIT_WINDOW', '60000'), 10),
        rateLimitMax: parseInt(nestConfigService.get('RATE_LIMIT_MAX', '100'), 10),
        corsOrigin: nestConfigService.get('CORS_ORIGIN', '*'),
        bcryptRounds: parseInt(nestConfigService.get('BCRYPT_ROUNDS', '12'), 10),
      },
    };
  }

  get(key: string): any {
    return this.config[key];
  }

  getApp() {
    return this.config.app;
  }

  getDatabase() {
    return this.config.database;
  }

  getRedis() {
    return this.config.redis;
  }

  getJwt() {
    return this.config.jwt;
  }

  getMpesa() {
    return this.config.mpesa;
  }

  getAi() {
    return this.config.ai;
  }

  getMinio() {
    return this.config.minio;
  }

  getEmail() {
    return this.config.email;
  }

  getKra() {
    return this.config.kra;
  }

  getSecurity() {
    return this.config.security;
  }
}
