import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Skip audit for public endpoints
    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        // Audit logic here (could be expanded)
        const timestamp = new Date().toISOString();
        const method = request.method;
        const url = request.url;

        console.log(`[AUDIT][${timestamp}] User: ${user.id} | ${method} ${url}`);
      }),
    );
  }
}
