import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

import { snakeCase } from '../../../providers/string-utils';

@Injectable({ scope: Scope.TRANSIENT })
export class WorkerUtilsService {
    public workerName: string;
    public jobName: string;
    public envPrefix: string;

    constructor(@Inject(INQUIRER) workerName: object) {
        this.workerName = workerName?.constructor?.name;
        if (!this.workerName) {
            throw new Error('Worker name not defined');
        }

        // workerName : GetPageImageWorker
        // jobName    : get_page_image
        // envPrefix  : WORKERS_GET_PAGE_IMAGE

        this.jobName = snakeCase(this.workerName.replace('Worker', ''));
        this.envPrefix = `WORKERS_${this.jobName.toUpperCase()}`;
    }

    getConcurrency(): number {
        const concurrency = parseInt(process.env[`${this.envPrefix}_CONCURRENCY`], 10);

        return Number.isNaN(concurrency) ? null : concurrency;
    }
}
