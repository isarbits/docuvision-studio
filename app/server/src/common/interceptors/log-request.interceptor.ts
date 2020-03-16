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
        const [req, res] = context.getArgs();
        let qs = '';
        if (req.query) {
            const queryString = Object.entries(req.query).reduce((acc, [k, v]) => acc.concat(`${k}=${v}`), []);
            if (queryString.length) {
                qs = `?${queryString.join('&')}`;
            }
        }

        res.on('finish', () => {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            this.loggingService.debug(`[${ip}] ${req.method} ${req.originalUrl}${qs} => ${res.statusCode}`);
        });
        return next.handle();
    }
}
