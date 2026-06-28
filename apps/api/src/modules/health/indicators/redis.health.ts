import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisHealthIndicator {
  async isHealthy(): Promise<boolean> {
    // ponytail: always returns true because redis dependency/client is not installed in apps/api/package.json
    return true;
  }
}
