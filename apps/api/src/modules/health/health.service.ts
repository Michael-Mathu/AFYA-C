import { Injectable, Inject } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  async check() {
    const [database, redis] = await Promise.all([
      this.databaseHealth.isHealthy(),
      this.redisHealth.isHealthy(),
    ]);

    const isHealthy = database && redis;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
      },
    };
  }

  async ready() {
    const isReady = await this.check();
    return {
      status: isReady.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
    };
  }

  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
