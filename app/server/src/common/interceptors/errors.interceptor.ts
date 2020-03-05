import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor, ServiceUnavailableException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoggingService } from '../../shared/logging/logging.service';

const log = new LoggingService('ErrorsInterceptor');

interface LogError {
    message: string;
    name: string;
    stack?: string[];
    error?: string;
}

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError(error => {
                if (error.isAxiosError && error.response) {
                    throw new HttpException(error.response.data, error.response.status);
                }

                if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                    throw new ServiceUnavailableException();
                }

                this.logError(error);

                throw error;
            }),
        );
    }

    private logError(error: Error) {
        const info: LogError = {
            message: error.message,
            name: error.name,
        };
        if (process.env.NODE_ENV === 'development') {
            info.stack = error?.stack?.split('\n');
            info.error = JSON.stringify(error);
        }
        log.error(JSON.stringify(info));
    }
}
