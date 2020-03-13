import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { workers } from 'config';
import { cpus } from 'os';
import { promisify } from 'util';

import { ClusterOnly } from '../../common/decorators/cluster-only.decorator';
import { LoggingService } from '../../shared/logging/logging.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { QueuesService, RateIntervals } from '../queues/queues.service';
import { AppInfo, AppProc } from './consumers.d';

@Injectable()
export class ConsumersService {
    private maxBytes: number;

    constructor(
        private readonly loggingService: LoggingService,
        private readonly queuesService: QueuesService,
        private readonly utilsService: UtilsService,
    ) {
        this.maxBytes = this.utilsService.humanToBytes(workers.cluster.memMax);
    }

    @ClusterOnly()
    async getConsumers(): Promise<AppInfo[]> {
        const { stdout } = await this.exec(`pm2 jlist`);

        return JSON.parse(stdout).reduce((consumers, app) => {
            if (app.name === workers.pm2AppName) {
                consumers.push({
                    ...app,
                    instanceId: app.pm2_env.INSTANCE_ID,
                });
            }

            return consumers;
        }, []);
    }

    @ClusterOnly()
    async add(count = 1) {
        const num = this.validate(count);

        const consumers = await this.getConsumers();
        if (consumers.length >= workers.cluster.max) {
            return { message: false, count: consumers.length };
        }

        await this.exec(`pm2 scale ${workers.pm2AppName} +${num}`);

        return { message: false, count: consumers.length + count };
    }

    @ClusterOnly()
    async set(count: number) {
        const num = this.validate(count);
        const consumers = await this.getConsumers();

        if (num > workers.cluster.max || num < workers.cluster.min || consumers.length === num) {
            return { message: false, count: consumers.length };
        }

        await this.exec(`pm2 scale ${workers.pm2AppName} ${num}`);

        return { message: true, count: num };
    }

    @ClusterOnly()
    async remove(count = 1) {
        const num = this.validate(count);
        const consumers = await this.getConsumers();
        const newValue = Math.max(1, consumers.length - num);

        if (consumers.length <= workers.cluster.min) {
            return { message: false, count: consumers.length, reason: `at min (${workers.cluster.min})` };
        }

        if (consumers.length === newValue) {
            return { message: false, count: consumers.length, reason: `same count ${newValue}` };
        }

        const slavePids: number[] = consumers.reduce((slaves, consumer) => {
            return consumer.instanceId === 0 ? slaves : slaves.concat(consumer.pm_id);
        }, []);

        if (!slavePids.length) {
            return { message: false, count: consumers.length, reason: 'no slaves' };
        }

        await this.exec(`pm2 delete ${slavePids.slice(0, consumers.length - newValue).join(' ')}`);

        return { message: true, count: newValue };
    }

    @ClusterOnly()
    @Cron(CronExpression.EVERY_30_SECONDS)
    async checkWorkerStatus() {
        try {
            if (!workers.cluster.autoScale) {
                return;
            }

            const { rates, current } = this.queuesService.getQueueInfo();
            if (current === null) {
                return;
            }

            const inOutRatio = rates.waiting[RateIntervals.ONE_MINUTE].m;

            const proc = await this.getConsumerUtilization();

            if (inOutRatio > workers.cluster.ioMax || current.waiting > workers.cluster.waitMax) {
                if (proc.cpu >= workers.cluster.cpuMax || proc.memory >= this.maxBytes) {
                    return;
                }

                const added = await this.add(1);

                if (added.message === true) {
                    this.loggingService.server(`Added worker (io:${inOutRatio}, wait:${current.waiting}, count:${added.count})`, proc);
                }
            } else if (current.waiting === 0 || proc.cpu > workers.cluster.cpuMax + 10 || proc.memory > this.maxBytes + 1024) {
                const removed = await this.remove(1);

                if (removed.message === true) {
                    this.loggingService.server(`Removed worker (io:${inOutRatio}, wait:${current.waiting}, count:${removed.count})`, proc);
                }
            }
        } catch (e) {
            this.loggingService.error('ConsumersService:checkWorkerStatus caught error:', e);
        }
    }

    private async getConsumerUtilization() {
        const consumers = await this.getConsumers();
        const threads = cpus().length;

        return consumers.reduce(
            (proc: AppProc, consumer: AppInfo) => {
                proc.cpu += consumer.monit.cpu / threads;
                proc.memory += consumer.monit.memory;

                return proc;
            },
            {
                cpu: 0,
                memory: 0,
            },
        );
    }

    private validate(count: number): number {
        const asNum = Number(count);
        if (!/^[0-9]+$/.test(`${count}`) || Number.isNaN(asNum)) {
            throw new UnprocessableEntityException(`count must be a number (${count}).`);
        }
        return asNum;
    }

    private exec(command: string) {
        return promisify(exec)(command);
    }
}
