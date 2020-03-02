import { Controller, HttpCode, HttpStatus, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ObservableDataInterceptor } from '../../common/interceptors/observable-data.interceptor';
import { DocumentsService } from './documents.service';

@Controller('documents')
@UseInterceptors(ObservableDataInterceptor)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Delete(':documentId')
    @HttpCode(HttpStatus.OK)
    deleteDocument(@Param('documentId') documentId: string) {
        return this.documentsService.deleteDocument(documentId);
    }
}
