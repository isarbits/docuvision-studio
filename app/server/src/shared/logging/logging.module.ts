import { Module, Logger } from '@nestjs/common';
import { LoggingService, LOGGING_LEVELS } from './logging.service';

const providers = [LoggingService, Logger, { provide: 'LOGGING_LEVELS', useValue: LOGGING_LEVELS }];

@Module({
    providers,
    exports: [...providers],
})
export class LoggingModule {}
