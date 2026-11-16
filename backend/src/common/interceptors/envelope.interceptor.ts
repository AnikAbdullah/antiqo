import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedShape {
  items: unknown;
  total: unknown;
  page: unknown;
  limit: unknown;
}

function isPaginated(value: unknown): value is PaginatedShape {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    'total' in value &&
    'page' in value &&
    'limit' in value
  );
}

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((payload: unknown) => {
        if (isPaginated(payload)) {
          const { items, total, page, limit } = payload;
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
