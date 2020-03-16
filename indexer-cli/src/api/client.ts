import { host } from 'config';
import * as fs from 'fs';
import { basename } from 'path';
import * as superagent from 'superagent';

export class StudioClient {
    private baseUri: string;

    constructor(config?: { host?: string }) {
        this.baseUri = config?.host || host;
    }

    public upload(file: string, params?: { ocrEngine?: string }): Promise<{ body: { id: string; status: string; url: string } }> {
        return superagent
            .post(`${this.baseUri}/documents`)
            .attach('file', fs.createReadStream(file), basename(file))
            .field('ocrEngine', params?.ocrEngine || '')
            .catch(this.handleApiError);
    }

    public documentExists(index: string, id: string) {
        return superagent
            .post(`${this.baseUri}/search/${index}/count`)
            .send({ query: { term: { id } } })
            .then(({ body }) => 0 !== body.count)
            .catch(this.handleApiError);
    }

    private handleApiError(error) {
        if (!error.response) {
            return Promise.reject(error);
        }

        const { statusCode, message, body, text } = error.response;
        return Promise.reject({ statusCode, message, body, text });
    }
}
