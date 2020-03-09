import { InjectQueue, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { statSync } from 'fs';
import { basename, dirname, extname, sep } from 'path';

import { Queues } from '../../../common/constants/queues';
import { LoggingService } from '../../../shared/logging/logging.service';
import Docuvision from '../../docuvision/docuvision.d';
import { DocuvisionService } from '../../docuvision/docuvision.service';
import { QueuesService } from '../../queues/queues.service';
import { IndexDocument, WorkerInterface } from '../consumers.d';

interface PrepareDocumentJobData {
    documentId: string;
    start: number;
    md5: string;
    filePath?: string;
}

@Processor('processing')
export class PrepareDocumentWorker implements WorkerInterface<PrepareDocumentJobData> {
    readonly jobName = Queues.PREPARE_DOCUMENT;

    constructor(
        @InjectQueue('processing') readonly processingQueue: Queue,
        private readonly loggingService: LoggingService,
        private readonly docuvisionService: DocuvisionService,
        private readonly queuesService: QueuesService,
    ) {
        this.processingQueue.process(this.jobName, this.work.bind(this));
    }

    async work(job: Job<PrepareDocumentJobData>) {
        const { data } = await this.docuvisionService.pollForCompletion(job.data.documentId);
        return this.enqueNext(job, data);
    }

    private async enqueNext(job: Job<PrepareDocumentJobData>, document: Docuvision.Document) {
        const baseDocument = this.convertJobToDocument(job, document);

        const pending = [this.indexDocuent(baseDocument)];

        for (const page of document.pages) {
            const pageNumber = page.pageNumber;

            pending.push(this.indexPage(baseDocument, pageNumber));
            pending.push(this.getPageImage(document.id, pageNumber));

            const wordCount = page.words.length;
            for (let index = 0; index < wordCount; index++) {
                const word: Docuvision.Word = page.words[index];

                pending.push(this.indexWord(baseDocument, pageNumber, word, index));
            }
        }

        await Promise.all(pending);
        this.loggingService.debug(`[job.id] ${baseDocument.id} created ${pending.length} tasks`);
    }

    private convertJobToDocument(job: Job<PrepareDocumentJobData>, document: Docuvision.Document): IndexDocument {
        const { md5, filePath } = job.data;

        const esDocument: IndexDocument = {
            id: md5,
            parentId: job.id,
            createdAt: new Date(),
            error: null,
            document: null,
            processingTime: Date.now() - job.processedOn,
        };

        if (filePath) {
            esDocument.upload = {
                path: filePath,
                folder: dirname(filePath),
                filename: basename(filePath),
                extension: extname(filePath),
                size: statSync(filePath).size,
                folderParts: filePath.split(sep).filter(Boolean),
                // folderTree: buildTreeFromPath(filePath),
                md5,
            };
        }

        if (document?.errors?.length) {
            esDocument.error = document.errors;
        } else {
            esDocument.document = document;
        }

        return esDocument;
    }

    private indexDocuent(baseDocument: IndexDocument) {
        return this.queuesService.publishProcessing(Queues.INDEX_DOCUMENT, baseDocument);
    }

    private indexPage(baseDocument: IndexDocument, pageNumber: number) {
        return this.queuesService.publishProcessing(Queues.INDEX_PAGE, { ...baseDocument, pageNumber });
    }

    private getPageImage(documentId: string, pageNumber: number) {
        return this.queuesService.publishProcessing(Queues.GET_PAGE_IMAGE, { documentId, pageNumber });
    }

    private indexWord(baseDocument: IndexDocument, pageNumber: number, word: Docuvision.Word, index: number) {
        return this.queuesService.publishProcessing(Queues.INDEX_WORD, { ...baseDocument, pageNumber, word, index });
    }
}
