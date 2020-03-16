import { InjectQueue, Processor } from '@nestjs/bull';
import { HttpService } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { elasticsearch, workers } from 'config';

import { Queues } from '../../../common/constants/queues';
import { LoggingService } from '../../../shared/logging/logging.service';
import { IndexDocument, WorkerInterface } from '../consumers.d';

@Processor('processing')
export class IndexDocumentWorker implements WorkerInterface<IndexDocument> {
    readonly jobName = Queues.INDEX_DOCUMENT;

    constructor(
        @InjectQueue('processing') readonly queue: Queue,
        readonly loggingService: LoggingService,
        private readonly httpService: HttpService,
    ) {
        this.queue.process(this.jobName, this.work.bind(this));
    }

    async work(job: Job<IndexDocument>) {
        const uri = `${workers.serverHost}/search/${elasticsearch.indices.document}/index`;

        return this.httpService
            .post(uri, job.data)
            .toPromise()
            .then(({ data }) => data);
    }
}
