import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotImplementedException, Param, Post, UseInterceptors } from '@nestjs/common';
import { ObservableDataInterceptor } from '../../common/interceptors/observable-data.interceptor';
import { MediaService } from './media.service';

@Controller('media')
@UseInterceptors(ObservableDataInterceptor)
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    createMedia() {
        throw new NotImplementedException();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    getMedia(@Param('index') index: string, @Body() query: {}) {
        return this.mediaService.getMedia(index, query);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    deleteMedia(@Param('index') index: string, @Body() query: {}) {
        return this.mediaService.deleteMedia(index, query);
    }
}
