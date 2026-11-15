import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');
  private readonly tracked = ['POST', 'PATCH', 'PUT', 'DELETE'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, originalUrl } = request;

    if (!this.tracked.includes(method)) {
      return next.handle();
    }

    const actor = request.user ? `user ${request.user.userId}` : 'anonymous';
    return next.handle().pipe(
      tap(() => this.logger.log(`${method} ${originalUrl} by ${actor}`)),
    );
  }
}
