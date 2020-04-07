import { InjectQueue, Processor } from '@nestjs/bull';
import { HttpService } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { elasticsearch, workers } from 'config';

import { Queues } from '../../../common/constants/queues';
import { strings } from '../../../common/constants/strings';
import { LoggingService } from '../../../shared/logging/logging.service';
import Docuvision from '../../docuvision/docuvision.d';
import { IndexDocument, IndexWord, WorkerInterface } from '../consumers.d';

interface IndexWordJobData extends IndexDocument {
    pageNumber: number;
    word: Docuvision.Word;
    index: number;
}

@Processor('processing')
export class IndexWordWorker implements WorkerInterface<IndexWordJobData> {
    readonly jobName = Queues.INDEX_WORD;

    constructor(
        @InjectQueue('processing') readonly queue: Queue,
        readonly loggingService: LoggingService,
        private readonly httpService: HttpService,
    ) {
        this.queue.process(this.jobName, this.work.bind(this));
    }

    async work(job: Job<IndexWordJobData>) {
        if (!job?.data) {
            throw new Error(strings.errors_invalid_job_data);
        }

        if (job?.data?.error) {
            return;
        }

        const { pageNumber, word, index, ...indexDocument } = job.data;

        const { pages, ...document } = indexDocument.document;
        const { words, ...page } = pages[job.data.pageNumber - 1];
        void [words];

        const body: IndexWord = {
            ...indexDocument,
            id: `${indexDocument.id}/${pageNumber}/${index}`,
            document,
            page,
            word: {
                ...word,
                index,
                x0: word.bb[0],
                y0: word.bb[1],
                x1: word.bb[2],
                y1: word.bb[3],
            },
        };

        const uri = `${workers.serverHost}/search/${elasticsearch.indices.word}/index`;

        return this.httpService
            .post(uri, body)
            .toPromise()
            .then(({ data }) => data);
    }
}
