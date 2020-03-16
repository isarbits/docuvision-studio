import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { EventsService } from './events.service';

const providers = [EventsService];

@Module({
    imports: [SharedModule],
    providers,
    exports: providers,
})
export class EventsModule {}
