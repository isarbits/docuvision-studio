import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { flatMap } from 'rxjs/operators';
import { PassThrough } from 'stream';

import { LogRequestInterceptor } from '../../common/interceptors/log-request.interceptor';
import { ObservableDataInterceptor } from '../../common/interceptors/observable-data.interceptor';
import { File } from '../../interfaces/file';
import { DocuvisionService } from '../docuvision/docuvision.service';
import { DocumentsService } from './documents.service';

@Controller('documents')
@UseInterceptors(ObservableDataInterceptor)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService, private readonly docuvisionService: DocuvisionService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    createDocument(@UploadedFile('file') file: File, @Body('path') filePath: string, @Body('ocrEngine') ocrEngine?: 'tesseract') {
        return this.documentsService.upload(file, { ocrEngine, filePath });
    }

    @Get(':documentId')
    @HttpCode(HttpStatus.OK)
    getDocument(@Param('documentId') documentId: string) {
        return this.docuvisionService.getDocument({ id: documentId });
    }

    @Delete(':documentId')
    @HttpCode(HttpStatus.OK)
    deleteDocument(@Param('documentId') documentId: string) {
        return this.documentsService.deleteDocument(documentId);
    }

    @Get(':documentId/pages/:pageNum/files/:file')
    @HttpCode(HttpStatus.OK)
    @Header('Content-Type', 'image/jpg')
    @UseInterceptors(new LogRequestInterceptor('DocumentsController'))
    async getPageFile(
        @Param('documentId') documentId: string,
        @Param('pageNum') pageNum: string,
        @Param('file') file: string,
        @Res() response: Response,
    ) {
        const buffer = await this.documentsService.getPageFile(documentId, pageNum, file);
        const stream = new PassThrough();
        stream.end(buffer);
        stream.pipe(response);

        return response;
    }

    @Get(':documentId/pages/:pageNum/downloads/:file')
    @HttpCode(HttpStatus.OK)
    download(@Param('documentId') documentId: string, @Param('pageNum') pageNum: string, @Param('file') file: string) {
        if (file === 'image') {
            return this.docuvisionService.getPageImage(documentId, pageNum).pipe(
                flatMap(res => {
                    return this.documentsService.createPageFile(documentId, pageNum, res.data, 'pageImage.jpg').then(() => res);
                }),
            );
        }
    }
}
