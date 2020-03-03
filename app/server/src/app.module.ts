import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { paths } from 'config';
import 'source-map-support/register';
import { DocumentsModule } from './modules/documents/documents.module';
import { SearchModule } from './modules/search/search.module';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({ rootPath: paths.staticDir }),
        SharedModule,
        SearchModule,
        DocumentsModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
        void consumer;
        // consumer.apply(contextMiddleware).forRoutes('*');
    }
}
