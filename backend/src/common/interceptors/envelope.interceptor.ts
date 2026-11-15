import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((payload) => {
        if (
          payload &&
          typeof payload === 'object' &&
          'items' in payload &&
          'total' in payload &&
          'page' in payload &&
          'limit' in payload
        ) {
          const { items, total, page, limit } = payload as Record<
            string,
            unknown
          >;
          return {
            success: true,
            message: 'OK',
            data: items,
            meta: { total, page, limit },
          };
        }
        return {
          success: true,
          message: 'OK',
          data: payload ?? null,
          meta: null,
        };
      }),
    );
  }
}
