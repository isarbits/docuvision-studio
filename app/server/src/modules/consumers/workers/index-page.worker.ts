import { InjectQueue, Processor } from '@nestjs/bull';
import { HttpService } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { elasticsearch, workers } from 'config';

import { Queues } from '../../../common/constants/queues';
import { strings } from '../../../common/constants/strings';
import { LoggingService } from '../../../shared/logging/logging.service';
import { IndexDocument, IndexPage, WorkerInterface } from '../consumers.d';

interface IndexPageJobData extends IndexDocument {
    pageNumber: number;
}

@Processor('processing')
export class IndexPageWorker implements WorkerInterface<IndexPageJobData> {
    readonly jobName = Queues.INDEX_PAGE;

    constructor(
        @InjectQueue('processing') readonly queue: Queue,
        readonly loggingService: LoggingService,
        private readonly httpService: HttpService,
    ) {
        this.queue.process(this.jobName, this.work.bind(this));
    }

    async work(job: Job<IndexPageJobData>) {
        if (!job?.data) {
            throw new Error(strings.errors_invalid_job_data);
        }

        if (job?.data?.error) {
            return;
        }

        const { pages, ...document } = job.data.document;
        const page = pages[job.data.pageNumber - 1];

        const body: IndexPage = {
            ...job.data,
            id: `${job.data.id}/${job.data.pageNumber}`,
            document,
            page,
        };

        const uri = `${workers.serverHost}/search/${elasticsearch.indices.page}/index`;

        return this.httpService
            .post(uri, body)
            .toPromise()
            .then(({ data }) => data);
    }
}
