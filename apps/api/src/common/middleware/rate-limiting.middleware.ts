import { Injectable, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { RateLimiterMiddleware } from './rate-limiter.middleware';

@Injectable()
export class RateLimitingMiddleware implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes(
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/auth/refresh', method: RequestMethod.POST },
        { path: 'api/billing/mpesa-push', method: RequestMethod.POST },
      );
  }
}
