import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60000; // 1 minute window
  private readonly maxRequests = 5; // Max 5 requests per window

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientId(req);
    const now = Date.now();

    const entry = this.requests.get(clientId);

    if (entry) {
      if (now < entry.resetTime) {
        if (entry.count >= this.maxRequests) {
          throw new BadRequestException(
            `Too many requests. Please try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds`
          );
        }
        entry.count++;
      } else {
        entry.count = 1;
        entry.resetTime = now + this.windowMs;
      }
    } else {
      this.requests.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    }

    // Clean up old entries periodically
    this.cleanup();

    next();
  }

  private getClientId(req: Request): string {
    // Use IP address as client identifier
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime + this.windowMs) {
        this.requests.delete(key);
      }
    }
  }
}
