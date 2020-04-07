import { HttpService, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { elasticsearch, paths } from 'config';
import { ReadStream } from 'fs';
import { join } from 'path';
import { forkJoin, Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';

import { Queues } from '../../common/constants/queues';
import { Docuvision, File } from '../../interfaces';
import { hashBuffer } from '../../providers/hash';
import { LoggingService } from '../../shared/logging/logging.service';
import { FileSystemService } from '../../shared/storage/filesystem.service';
import { DocuvisionService } from '../docuvision/docuvision.service';
import { QueuesService } from '../queues/queues.service';
import { SearchService } from '../search/search.service';

type UploadResponse = AxiosResponse<Docuvision.Document & { taskId?: string | number }>;

@Injectable()
export class DocumentsService {
    constructor(
        private readonly loggingService: LoggingService,
        private readonly httpService: HttpService,
        private readonly fileSystemService: FileSystemService,
        private readonly docuvisionService: DocuvisionService,
        private readonly queuesService: QueuesService,
        private readonly searchService: SearchService,
    ) {}

    async upload(file: File, params?: { ocrEngine?: 'tesseract'; filePath?: string }) {
        const md5 = await hashBuffer(file.buffer);
        if (await this.md5Exists(md5)) {
            return { data: { status: HttpStatus.OK, text: 'Document exists' } };
        }

        const start = Date.now();

        return this.docuvisionService.upload(file, params).pipe(
            flatMap(async (response: UploadResponse) => {
                const documentId = response.data.id;
                const filePath = params?.filePath;
                const { buffer, ...rest } = file;
                void buffer;

                const job = await this.queuesService.publish('processing', Queues.PREPARE_DOCUMENT, {
                    documentId,
                    file: rest,
                    start,
                    md5,
                    filePath,
                });
                response.data.taskId = job.id;

                return response;
            }),
            catchError(async error => {
                await this.markDocumentFailed(error, md5, Date.now() - start, params.filePath);
                throw error;
            }),
        );
    }

    getPageFile(documentId: string, pageNumber: string, file: string): Promise<Buffer | ReadStream> {
        return this.fileSystemService.getFile(join(paths.assetsDir, documentId, pageNumber, file)).catch(error => {
            if (error?.code === 'ENOENT') {
                throw new NotFoundException();
            }
            throw error;
        });
    }

    createPageFile(documentId: string, pageNumber: string, buffer: Buffer | ReadStream, name: string) {
        return this.fileSystemService.putFile(join(paths.assetsDir, documentId, pageNumber, name), buffer);
    }

    deleteDocument(documentId: string): Observable<AxiosResponse<any>[]> {
        const query = { term: { 'document.id.keyword': documentId } };
        const uri = `${elasticsearch.node}/docuvision/_delete_by_query`;

        this.loggingService.debug({ uri, query });

        return forkJoin(this.httpService.post(`${elasticsearch.node}/docuvision/_delete_by_query`, { query }), this.deleteDocumentPages(documentId));
    }

    private markDocumentFailed(error: any, md5: string, duration: number, filePath?: string) {
        let ret = {};
        if (error?.reponse?.data) {
            ret = { ...error };
        } else if (error instanceof Error) {
            ret = { message: error.message, stack: error.stack };
        } else {
            ret = { error };
        }

        return this.queuesService.publish('processing', Queues.INDEX_DOCUMENT, { ...ret, md5, filePath, duration, failed: true });
    }

    private deleteDocumentPages(documentId: string): Observable<AxiosResponse<{}>> {
        const query = { term: { 'document.id.keyword': documentId } };
        const uri = `${elasticsearch.node}/docuvision_page/_delete_by_query`;

        this.loggingService.debug({ uri, query });

        return this.httpService.post(`${elasticsearch.node}/docuvision_page/_delete_by_query`, { query });
    }

    private md5Exists(md5: string) {
        return this.searchService
            .count({
                index: elasticsearch.indices.document,
                body: {
                    query: {
                        term: {
                            id: md5,
                        },
                    },
                },
            })
            .then(({ body }) => 0 !== body.count)
            .catch(e => {
                this.loggingService.error(e);
                return false;
            });
    }
}
