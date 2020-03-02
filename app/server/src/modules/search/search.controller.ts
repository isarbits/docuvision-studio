import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';
import { ObservableDataInterceptor } from '../../common/interceptors/observable-data.interceptor';
import { ElasticIndexPipe } from '../../common/pipes/elastic-index.pipe';
import { SearchService } from './search.service';

@Controller('search')
@UseInterceptors(ObservableDataInterceptor)
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Post(':index/_search')
    @HttpCode(HttpStatus.OK)
    search(@Param('index', new ElasticIndexPipe()) uri: string, @Body() query: {}) {
        return this.searchService.search(uri, query);
    }
}
