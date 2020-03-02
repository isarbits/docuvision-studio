import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { elasticsearch } from 'config';
import { LoggingService } from '../../shared/logging/logging.service';
import { Observable, forkJoin } from 'rxjs';

@Injectable()
export class DocumentsService {
    constructor(private readonly loggingService: LoggingService, private readonly httpService: HttpService) {}

    public deleteDocument(documentId: string): Observable<AxiosResponse<any>[]> {
        const query = { term: { 'document.id.keyword': documentId } };
        const uri = `${elasticsearch.node}/docuvision/_delete_by_query`;

        this.loggingService.debug({ uri, query });

        return forkJoin(this.httpService.post(`${elasticsearch.node}/docuvision/_delete_by_query`, { query }), this.deleteDocumentPages(documentId));
    }

    private deleteDocumentPages(documentId: string): Observable<AxiosResponse<{}>> {
        const query = { term: { 'document.id.keyword': documentId } };
        const uri = `${elasticsearch.node}/docuvision_page/_delete_by_query`;

        this.loggingService.debug({ uri, query });

        return this.httpService.post(`${elasticsearch.node}/docuvision_page/_delete_by_query`, { query });
    }
}
