import { RequestParams } from '@elastic/elasticsearch';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';

import { LogRequestInterceptor } from '../../common/interceptors/log-request.interceptor';
import { ObservableDataInterceptor } from '../../common/interceptors/observable-data.interceptor';
import { SearchService } from './search.service';

type Params<T> = Exclude<T, 'index'>;

@Controller('search')
@UseInterceptors(new ObservableDataInterceptor('body'), new LogRequestInterceptor('SearchController'))
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Post(':index/_search')
    @HttpCode(HttpStatus.OK)
    async search(@Param('index') index: string, @Body() body: Params<RequestParams.Search>): Promise<any> {
        return this.searchService.search({ index, body });
    }

    @Post(':index/count')
    @HttpCode(HttpStatus.OK)
    async count(@Param('index') index: string, @Body() body: Params<RequestParams.Count>): Promise<any> {
        return this.searchService.count({ index, body });
    }

    @Post(':index/bulk')
    @HttpCode(HttpStatus.OK)
    bulk(@Param('index') index: string, @Body() body: Params<RequestParams.Bulk>) {
        return this.searchService.bulk({ index, body });
    }

    @Post(':index/delete-by-query')
    @HttpCode(HttpStatus.OK)
    deleteByQuery(@Param('index') index: string, @Body() body: Params<RequestParams.DeleteByQuery>) {
        return this.searchService.deleteByQuery({ index, body });
    }

    @Get(':index/exists')
    @HttpCode(HttpStatus.OK)
    indexExists(@Param('index') index: string) {
        return this.searchService.indexExists({ index });
    }

    @Get(':index/exists/:documentId')
    @HttpCode(HttpStatus.OK)
    documentExists(@Param('index') index: string, @Param('documentId') id: string) {
        return this.searchService.exists({ index, id });
    }

    @Post(':index/index')
    @HttpCode(HttpStatus.OK)
    index(@Param('index') index: string, @Body() body: Params<RequestParams.Index>) {
        return this.searchService.index({ index, body });
    }

    @Post(':index/indices-create')
    @HttpCode(HttpStatus.OK)
    indicesCreate(@Param('index') index: string, @Body() body: Params<RequestParams.IndicesCreate>) {
        return this.searchService.indicesCreate({ index, body });
    }
}
