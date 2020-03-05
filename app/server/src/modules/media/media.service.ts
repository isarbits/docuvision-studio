import { Injectable } from '@nestjs/common';
import { paths } from 'config';

import { LoggingService } from '../../shared/logging/logging.service';

@Injectable()
export class MediaService {
    constructor(private readonly loggingService: LoggingService) {}

    public createMedia(...args: any[]) {
        this.loggingService.debug(paths.mediaFolder);
        return args;
    }

    public getMedia(...args: any[]) {
        this.loggingService.debug('');
        return args;
    }

    public deleteMedia(...args: any[]) {
        this.loggingService.debug('');
        return args;
    }
}
