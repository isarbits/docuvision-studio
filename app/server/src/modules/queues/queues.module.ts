import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { DocuvisionModule } from '../docuvision/docuvision.module';
import { EventsModule } from '../events/events.module';
import { QueueConnectionsModule } from './queue-connections.module';
import { QueueEventsService } from './queue-events.service';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';

const providers = [QueuesService, QueueEventsService];

@Module({
    imports: [QueueConnectionsModule, SharedModule, DocuvisionModule, EventsModule],
    providers,
    exports: providers,
    controllers: [QueuesController],
})
export class QueuesModule {}
