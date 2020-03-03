import { docuvision } from 'config';
import * as fs from 'fs';
import { basename } from 'path';
import * as superagent from 'superagent';
import { DocuvisionClient } from './docuvision.d';
import { URL } from 'url';

/**
 * Basic docuvision client wrapper
 *
 * @class Client (name)
 */
export class Client {
    private baseUri: string;
    private authHeader: string;

    constructor(config?: DocuvisionClient.ClientConfig) {
        this.baseUri = config?.host || docuvision.host;
        this.authHeader = `ApiKey ${config?.apiKey || docuvision.apiKey}`;
        void this.createKey;
    }

    upload(params: DocuvisionClient.UploadRequest): Promise<DocuvisionClient.UploadResponse> {
        return superagent
            .post(`${this.baseUri}/v1/document/upload`)
            .attach('file', fs.createReadStream(params.file), basename(params.file))
            .set('Authorization', this.authHeader)
            .catch(this.handleApiError);
    }

    getDocument(params: DocuvisionClient.GetDocumentRequest): Promise<DocuvisionClient.GetDocumentResponse> {
        const { fromPage, toPage } = params;

        return superagent
            .get(`${this.baseUri}/v1/document/${params.id}${this.serialize({ fromPage, toPage })}`)
            .set('Authorization', this.authHeader)
            .catch(this.handleApiError);
    }

    listDocuments(params?: DocuvisionClient.ListDocumentsRequest): Promise<DocuvisionClient.ListDocumentsResponse> {
        return superagent
            .get(`${this.baseUri}/v1/document${this.serialize(params)}`)
            .set('Authorization', this.authHeader)
            .catch(this.handleApiError);
    }

    deleteDocument(params?: DocuvisionClient.DeleteDocumentRequest): Promise<DocuvisionClient.DeleteDocumentResponse> {
        return superagent
            .delete(`${this.baseUri}/v1/document/${params.docId}`)
            .set('Authorization', this.authHeader)
            .catch(this.handleApiError);
    }

    getPageImage(params?: string | DocuvisionClient.GetDocumentPageImageRequest): Promise<DocuvisionClient.GetDocumentPageImageResponse> {
        const fullImageUri = typeof params === 'string' ? params : `${this.baseUri}/v1/document/${params.documentId}/${params.pageNum}.jpg`;

        return superagent
            .get(fullImageUri)
            .set('Authorization', this.authHeader)
            .catch(this.handleApiError);
    }

    async pollForCompletion(docId: string, maxWaitSeconds = 0) {
        let waitedSeconds = 0;
        let response: DocuvisionClient.GetDocumentResponse;

        while (!maxWaitSeconds || waitedSeconds++ < maxWaitSeconds) {
            response = await this.getDocument({ id: docId });

            if (response?.body?.status === 'completed') {
                break;
            }

            await new Promise(res => setTimeout(res, 1000));
        }

        if (response?.body?.status === 'pending') {
            throw new Error('Docuvision took too long to respond');
        }

        return response;
    }

    reachable(): Promise<boolean> {
        return superagent
            .get(`${this.baseUri}/v1/_ping`)
            .then(() => true)
            .catch(e => e?.status === 404);
    }

    // this will be removed from the demo app
    private async createKey(email, password, name) {
        if (!email || !password || !name) {
            throw new Error('this is a secret');
        }
        const login = await superagent.post(`${this.baseUri}/auth/login`).send({ email, password });

        const accessToken = login.body.accessToken;

        return await superagent
            .post(`${this.baseUri}/api-keys/create`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name });
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

    private handleApiError(error) {
        if (!error.response) {
            return Promise.reject(error);
        }

        const { statusCode, message, body, text } = error.response;
        return Promise.reject({ statusCode, message, body, text });
    }
}
