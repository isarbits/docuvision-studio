import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { elasticsearch, paths } from 'config';
import { join } from 'path';
import { forkJoin, Observable } from 'rxjs';
import { LoggingService } from '../../shared/logging/logging.service';
import { FileSystemService } from '../../shared/storage/filesystem.service';

@Injectable()
export class DocumentsService {
    constructor(
        private readonly loggingService: LoggingService,
        private readonly httpService: HttpService,
        private readonly fileSystemService: FileSystemService,
    ) {}

    public getPageFile(documentId: string, pageNumber: string, file: string): Promise<Buffer> {
        return this.fileSystemService.getFile(join(paths.assetsDir, documentId, pageNumber, file));
    }

    public createPageFile(documentId: string, pageNumber: string, buffer: Buffer, name: string) {
        return this.fileSystemService.putFile(join(paths.assetsDir, documentId, pageNumber, name), buffer);
    }

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
