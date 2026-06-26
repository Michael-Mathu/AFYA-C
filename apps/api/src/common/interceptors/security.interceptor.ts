import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Add security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.setHeader('Content-Security-Policy', "default-src 'self'");

    // Log request for audit
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('user-agent') || 'unknown';
    const ip = request.ip || request.connection.remoteAddress || 'unknown';

    console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now();
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} - ${responseTime}ms`);
      }),
    );
  }
}
