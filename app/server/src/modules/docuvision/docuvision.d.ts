import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

import { File } from '../../interfaces/file';

declare namespace Docuvision {
    interface ApiResponse<T = any> extends Observable<AxiosResponse<T>> {
        body: T;
    }

    interface ClientConfig {
        host?: string;
        apiKey?: string;
    }

    interface Word {
        text: string;
        bb: [number, number, number, number];
        angle: number;
    }

    interface Page {
        pageNumber: number;
        status: string;
        errors: string;
        height: number;
        width: number;
        fullText: string;
        words: Word[];
        imgUrl: string;
    }

    interface Document {
        id: string;
        url: string;
        status: string;
        filename: string;
        mimeType: string;
        errors: string;
        warnings: string;
        uploadedDate: number;
        completedDate: number;
        pages: Page[];
        pageCount: number;
        fromPage: number;
        toPage: number;
    }

    interface UploadRequest {
        file: File;
        ocrEngine?: 'tesseract' | 'google';
    }

    type UploadResponse = ApiResponse<{
        id: string;
        status: string;
        url: string;
    }>;

    interface GetDocumentRequest {
        id: string;
        fromPage?: number;
        toPage?: number;
    }

    type GetDocumentResponse = ApiResponse<Document>;

    interface ListDocumentsRequest {
        offset?: number;
        limit?: number;
    }

    type ListDocumentsResponse = ApiResponse<{
        offset: number;
        limit: number;
        total: number;
        data: Document[];
    }>;

    interface DeleteDocumentRequest {
        docId: string;
    }

    type DeleteDocumentResponse = ApiResponse<boolean>;

    interface GetDocumentPageImageRequest {
        documentId: string;
        pageNum: number;
    }

    type GetDocumentPageImageResponse = Buffer;
}

export = Docuvision;
