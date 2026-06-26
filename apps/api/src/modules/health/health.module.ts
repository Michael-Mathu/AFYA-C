import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [HealthService, DatabaseHealthIndicator, RedisHealthIndicator],
  exports: [HealthService],
})
export class HealthModule {}
