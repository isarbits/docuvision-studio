import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseInterceptors } from '@nestjs/common';

import { LogRequestInterceptor } from '../../common/interceptors/log-request.interceptor';
import { StringToIntPipe } from '../../common/pipes/string-to-int.pipe';
import { AppInfo } from './consumers.d';
import { ConsumersService } from './consumers.service';

@Controller('consumers')
@UseInterceptors(new LogRequestInterceptor('ConsumersController'))
export class ConsumersController {
    constructor(private readonly consumersService: ConsumersService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    getConsumers(): Promise<AppInfo[]> {
        return this.consumersService.getConsumers();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    createConsumers(@Body('count', new StringToIntPipe()) count?: number) {
        return this.consumersService.add(count);
    }

    @Put()
    @HttpCode(HttpStatus.ACCEPTED)
    updateConsumers(@Body('count', new StringToIntPipe()) count: number) {
        return this.consumersService.set(count);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    removeConsumers(@Query('count', new StringToIntPipe()) count?: number) {
        return this.consumersService.remove(count);
    }
}
