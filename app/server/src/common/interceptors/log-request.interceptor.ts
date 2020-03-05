import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { LoggingService } from '../../shared/logging/logging.service';

@Injectable()
export class LogRequestInterceptor<T = any> implements NestInterceptor<T, T> {
    private loggingService: LoggingService;

    constructor(readonly logName: string) {
        this.loggingService = new LoggingService(logName);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
        const [{ method, url, params, body, query }, res] = context.getArgs();
        let qs = '';
        if (query) {
            const queryString = Object.entries(query).reduce((acc, [k, v]) => acc.concat(`${k}=${v}`), []);
            if (queryString.length) {
                qs = `?${queryString.join('&')}`;
            }
        }
        void [params, body];

        return next.handle().pipe(obs => {
            this.loggingService.debug(`${method} ${url}${qs} => ${res.statusCode}`);
            return obs;
        });
    }
}
