import 'source-map-support/register';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { externalWorkers, paths } from 'config';

import { ConsumersModule } from './modules/consumers/consumers.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { QueuesModule } from './modules/queues/queues.module';
import { SearchModule } from './modules/search/search.module';
import { SharedModule } from './shared/shared.module';

const imports = [
    ServeStaticModule.forRoot({ rootPath: paths.publicDir }),
    ScheduleModule.forRoot(),
    SharedModule,
    SearchModule,
    DocumentsModule,
    QueuesModule,
];
if (!externalWorkers) {
    imports.push(ConsumersModule);
}

@Module({ imports })
export class AppModule {}
