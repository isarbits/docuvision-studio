import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObservableDataInterceptor } from '../../common/interceptors/observable-data.interceptor';
import { StringToBooleanPipe } from '../../common/pipes/string-to-boolean.pipe';
import { File } from '../../interfaces/file';
import { DocumentsService } from './documents.service';
import { DocuvisionService } from '../docuvision/docuvision.service';
import { map } from 'rxjs/operators';

@Controller('documents')
@UseInterceptors(ObservableDataInterceptor)
export class DocumentsController {
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly docuvisionService: DocuvisionService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    createDocument(
        @UploadedFile('file') file: File,
        @Body('ocrEngine') ocrEngine?: 'tesseract',
        @Body('waitForCompletion', new StringToBooleanPipe()) waitForCompletion?: boolean,
    ) {
        return this.docuvisionService.upload(file, { ocrEngine, waitForCompletion });
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
    getPageFile(@Param('documentId') documentId: string, @Param('pageNum') pageNum: string, @Param('file') file: string) {
        return this.documentsService.getPageFile(documentId, pageNum, file);
    }

    @Get(':documentId/pages/:pageNum/downloads/:file')
    @HttpCode(HttpStatus.OK)
    download(@Param('documentId') documentId: string, @Param('pageNum') pageNum: string, @Param('file') file: string) {
        if (file === 'image') {
            return this.docuvisionService.getPageImage(documentId, pageNum)
                .pipe(map(res => {
                    console.log(typeof res.data);
                    console.log(Buffer.isBuffer(res.data));
                    return this.documentsService.createPageFile(documentId, pageNum, res.data, 'pageImage.jpg')
                        .then(() => res);
                }));
        }
    }
}
