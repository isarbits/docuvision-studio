import { InjectQueue, Processor } from '@nestjs/bull';
import { HttpService } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { workers } from 'config';

import { Queues } from '../../../common/constants/queues';
import { strings } from '../../../common/constants/strings';
import { WorkerInterface } from '../consumers.d';

interface GetPageImageJobData {
    documentId: string;
    pageNumber: number;
}

@Processor('processing')
export class GetPageImageWorker implements WorkerInterface<GetPageImageJobData> {
    readonly jobName = Queues.GET_PAGE_IMAGE;

    constructor(@InjectQueue('processing') readonly queue: Queue, private readonly httpService: HttpService) {
        this.queue.process(this.jobName, this.work.bind(this));
    }

    async work(job: Job<GetPageImageJobData>) {
        if (!job?.data) {
            throw new Error(strings.errors_invalid_job_data);
        }

        const { documentId, pageNumber } = job.data;
        const uri = `${workers.serverHost}/documents/${documentId}/pages/${pageNumber}/downloads/pageImage`;

        return this.httpService
            .get(uri)
            .toPromise()
            .then(({ data }) => data);
    }
}
