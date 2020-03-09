import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseInterceptors } from '@nestjs/common';

import { LogRequestInterceptor } from '../../common/interceptors/log-request.interceptor';
import { ConsumersService } from './consumers.service';

@Controller('consumers')
@UseInterceptors(new LogRequestInterceptor('ConsumersController'))
export class ConsumersController {
    constructor(private readonly consumersService: ConsumersService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    getConsumers() {
        return this.consumersService.getConsumers();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    createConsumers(@Body('count') count?: number) {
        return this.consumersService.add(count);
    }

    @Put()
    @HttpCode(HttpStatus.ACCEPTED)
    updateConsumers(@Body('count') count: number) {
        console.log(count);
        return this.consumersService.set(count);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    removeConsumers(@Query('count') count?: string) {
        return this.consumersService.remove(count);
    }
}
