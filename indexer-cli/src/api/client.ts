import { host } from 'config';
import * as fs from 'fs';
import { basename } from 'path';
import * as superagent from 'superagent';
import { Docuvision } from '../docuvision/docuvision.d';
import { IndexDocument, IndexPage, IndexWord } from '../elastic/index.d';
import { SearchResponse } from '../interfaces';

export class StudioClient {
    private baseUri: string;

    constructor(config?: Docuvision.ClientConfig) {
        this.baseUri = config?.host || host;
    }

    public search(index: string, params): Promise<SearchResponse> {
        return superagent
            .post(`${this.baseUri}/${index}/_search`)
            .send(params)
            .catch(this.handleApiError);
    }

    public upload(file: string, params: { waitForCompletion?: boolean, ocrEngine?: 'tesseract' | 'google' }): Promise<Docuvision.UploadResponse | Docuvision.Document> {
        return superagent
            .post(`${this.baseUri}/documents`)
            .attach('file', fs.createReadStream(file), basename(file))
            .field('waitForCompletion', !!params.waitForCompletion)
            .catch(this.handleApiError);
    }

    public documentExists(index: string, id: string) {
        return superagent.post(`${this.baseUri}/search/${index}/count`)
            .send({ query: { term: { id } } })
            .then(({ body }) => 0 !== body.count)
            .catch(this.handleApiError);
    }

    public download(documentId: string, pageNumber: number, file: string): Promise<Docuvision.GetDocumentPageImageResponse> {
        const uri = `${this.baseUri}/documents/${documentId}/pages/${pageNumber}/downloads/${file}`;

        return superagent.get(uri)
            .then(({ body }) => body)
            .catch(this.handleApiError);
    }

    public indexDocument(document: IndexDocument) {
        return superagent.post(`${this.baseUri}/search/docuvision/index`)
            .send(document)
            .catch(this.handleApiError);
    }

    public indexPage(page: IndexPage) {
        return superagent.post(`${this.baseUri}/search/docuvision_page/index`)
            .send(page)
            .catch(this.handleApiError);
    }

    public indexWord(word: IndexWord) {
        return superagent.post(`${this.baseUri}/search/docuvision_word/index`)
            .send(word)
            .catch(this.handleApiError);
    }

    public indexWords(words: IndexWord[]) {
        const body = words.flatMap(word => [{ index: { _index: 'docuvision_word', _type: '_doc' } }, word]);

        return superagent.post(`${this.baseUri}/search/docuvision_word/bulk`)
            .send(body)
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
