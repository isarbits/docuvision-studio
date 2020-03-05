import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

import { File } from '../../interfaces/file';

export namespace Docuvision {
    export interface ApiResponse<T = any> extends Observable<AxiosResponse<T>> {
        body: T;
    }

    export interface ClientConfig {
        host?: string;
        apiKey?: string;
    }

    export interface Word {
        text: string;
        bb: [number, number, number, number];
        angle: number;
    }

    export interface Page {
        pageNumber: number;
        status: string;
        errors: string;
        height: number;
        width: number;
        fullText: string;
        words: Word[];
        imgUrl: string;
    }

    export interface Document {
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

    export interface UploadRequest {
        file: File;
        ocrEngine?: 'tesseract' | 'google';
    }

    export type UploadResponse = ApiResponse<{
        id: string;
        status: string;
        url: string;
    }>;

    export interface GetDocumentRequest {
        id: string;
        fromPage?: number;
        toPage?: number;
    }

    export type GetDocumentResponse = ApiResponse<Document>;

    export interface ListDocumentsRequest {
        offset?: number;
        limit?: number;
    }

    export type ListDocumentsResponse = ApiResponse<{
        offset: number;
        limit: number;
        total: number;
        data: Document[];
    }>;

    export interface DeleteDocumentRequest {
        docId: string;
    }

    export type DeleteDocumentResponse = ApiResponse<boolean>;

    export interface GetDocumentPageImageRequest {
        documentId: string;
        pageNum: number;
    }

    export type GetDocumentPageImageResponse = Buffer;
}
