import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [SharedModule],
    providers: [SearchService],
    controllers: [SearchController],
    exports: [SearchService],
})
export class SearchModule {}
