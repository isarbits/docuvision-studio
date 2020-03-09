import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { paths } from 'config';
import 'source-map-support/register';

import { ConsumersModule } from './modules/consumers/consumers.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { QueuesModule } from './modules/queues/queues.module';
import { SearchModule } from './modules/search/search.module';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({ rootPath: paths.staticDir }),
        ScheduleModule.forRoot(),
        SharedModule,
        SearchModule,
        DocumentsModule,
        QueuesModule,
        ConsumersModule,
    ],
})
export class AppModule {}
