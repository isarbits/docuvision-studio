import { DynamicModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SharedModule } from '../../shared/shared.module';
import { DocuvisionModule } from '../docuvision/docuvision.module';
import { EventsModule } from '../events/events.module';
import { QueueConnectionsModule } from '../queues/queue-connections.module';
import { DISABLE_QUEUE_STATS, QueuesService } from '../queues/queues.service';
import { SearchModule } from '../search/search.module';
import { ConsumersController } from './consumers.controller';
import { ConsumersService } from './consumers.service';
import { GetPageImageWorker } from './workers/get-page-image.worker';
import { IndexDocumentWorker } from './workers/index-document.worker';
import { IndexPageWorker } from './workers/index-page.worker';
import { IndexWordWorker } from './workers/index-word.worker';
import { PrepareDocumentWorker } from './workers/prepare-document.worker';
import { WorkerUtilsService } from './workers/worker-utils.service';

const workers = [IndexWordWorker, IndexPageWorker, IndexDocumentWorker, GetPageImageWorker, PrepareDocumentWorker];

const providers = [...workers, WorkerUtilsService, QueuesService, { provide: DISABLE_QUEUE_STATS, useValue: true }];

@Module({
    imports: [SearchModule, QueueConnectionsModule, SharedModule, DocuvisionModule, EventsModule],
    providers,
    exports: providers,
})
export class ConsumersModule {
    static forRoot(): DynamicModule {
        if (!process.env.PM2_HOME) {
            throw new Error('ConsumersModule.forRoot requires pm2');
        }

        const rootProviders = [...providers, ConsumersService];

        return {
            module: ConsumersModule,
            imports: [ScheduleModule.forRoot()],
            providers: rootProviders,
            exports: rootProviders,
            controllers: [ConsumersController],
        };
    }
}
