import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { docuvision } from 'config';
import * as FormData from 'form-data';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { Readable } from 'stream';

import { File } from '../../interfaces';
import Docuvision from './docuvision.d';

type HttpRes<T> = Observable<AxiosResponse<T>>;

@Injectable()
export class DocuvisionService {
    private authHeader: string;

    constructor(private readonly httpService: HttpService) {
        this.authHeader = `ApiKey ${docuvision.apiKey}`;
    }

    upload(file: File, params?: { ocrEngine?: 'tesseract' }): HttpRes<Docuvision.Document> {
        const uri = `${docuvision.host}/v1/document/upload`;

        const readable = new Readable();
        readable.push(file.buffer);
        readable.push(null);

        const formData = new FormData();
        formData.append('file', readable, file.originalname);
        if (params.ocrEngine) {
            formData.append('ocrEngine', params.ocrEngine);
        }

        return this.httpService.post<Docuvision.Document>(uri, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: this.authHeader,
            },
        });
    }

    getDocument(params: Docuvision.GetDocumentRequest): HttpRes<Docuvision.Document> {
        const { fromPage, toPage } = params;
        const uri = `${docuvision.host}/v1/document/${params.id}${this.serialize({ fromPage, toPage })}`;

        return this.httpService.get(uri, this.getConfig());
    }

    listDocuments(params?: Docuvision.ListDocumentsRequest): HttpRes<Docuvision.Document[]> {
        const uri = `${docuvision.host}/v1/document${this.serialize(params)}`;

        return this.httpService.get(uri, this.getConfig());
    }

    deleteDocument(params?: Docuvision.DeleteDocumentRequest): HttpRes<boolean> {
        const uri = `${docuvision.host}/v1/document/${params.docId}`;

        return this.httpService.delete(uri, this.getConfig());
    }

    getPageImage(documentId: string, pageNumber: string): HttpRes<Docuvision.GetDocumentPageImageResponse> {
        const uri = `${docuvision.host}/v1/document/${documentId}/${pageNumber}.jpg`;

        return this.httpService.get(uri, {
            responseType: 'arraybuffer',
            headers: {
                Authorization: this.authHeader,
                Accept: 'image/jpg',
            },
        });
    }

    async pollForCompletion(docId: string, maxWaitSeconds = 0): Promise<AxiosResponse<Docuvision.Document>> {
        let waitedSeconds = 0;
        let response: AxiosResponse<Docuvision.Document>;

        do {
            response = await this.getDocument({ id: docId }).toPromise();

            if (response?.data?.status === 'completed') {
                break;
            }

            await new Promise(res => setTimeout(res, 1000));
        } while (!maxWaitSeconds || waitedSeconds++ < maxWaitSeconds);

        if (response?.data?.status === 'pending') {
            throw new Error('Docuvision took too long to respond');
        }

        return response;
    }

    reachable(): Observable<boolean> {
        const uri = `${docuvision.host}/v1/ping`;

        return this.httpService.get(uri, this.getConfig()).pipe(
            flatMap(() => Promise.resolve(true)),
            catchError(err => Promise.resolve([404, 401, 403].includes(err?.status))),
        );
    }

    /**
     * Convert key:value into querystring
     *
     * @param {object}  params  Key value object
     */
    private serialize(params: object) {
        return Object.entries(params || {}).reduce((url: URL, [key, value]) => {
            if (value !== null && typeof value !== 'undefined') {
                url.searchParams.append(key, `${value}`);
            }
            return url;
        }, new URL('https://example.de')).search;
    }

    private getConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
        return {
            headers: {
                Authorization: this.authHeader,
            },
            ...config,
        };
    }
}
