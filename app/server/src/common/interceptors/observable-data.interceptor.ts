import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Optional } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data?: T;
    body?: T;
}

@Injectable()
export class ObservableDataInterceptor<T = any> implements NestInterceptor<T, Response<T>> {
    constructor(@Optional() private readonly key: string = 'data') {}

    intercept(_context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(map(response => response[this.key]));
    }
}
