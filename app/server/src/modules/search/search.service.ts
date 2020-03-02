import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { LoggingService } from '../../shared/logging/logging.service';

@Injectable()
export class SearchService {
    constructor(private readonly loggingService: LoggingService, private readonly httpService: HttpService) {}

    public search(uri: string, query: {}): Observable<AxiosResponse<{}>> {
        this.loggingService.debug(JSON.stringify({ uri, query }));

        return this.httpService.post(uri, query);
    }
}
