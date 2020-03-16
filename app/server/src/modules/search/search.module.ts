import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { elasticsearch } from 'config';

import { SharedModule } from '../../shared/shared.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [SharedModule, ElasticsearchModule.register({ node: elasticsearch.node })],
    providers: [SearchService],
    controllers: [SearchController],
    exports: [SearchService],
})
export class SearchModule {}
