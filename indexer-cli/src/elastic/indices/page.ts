import { docuvision, elastic, paths } from 'config';
import { DocuvisionClient } from 'interfaces';
import { Client } from '../../docuvision/docuvision';
import { logError } from '../../logging/es-log';
import { SearchManager } from '../search/search-manager';
import { FileSystemStatic } from '../../storage/filesystem';
import { IndexDocument, IndexPage } from '../index.d';
import { join } from 'path';

const docuvisionClient = new Client({
    host: docuvision.host,
    apiKey: docuvision.apiKey,
});

const esClient = SearchManager.getClient({
    node: elastic.node,
    index: `${elastic.index}_page`,
});

const getPageImage = (page: DocuvisionClient.Page, docId: string) => {
    return docuvisionClient.getPageImage(page.imgUrl).then(({ body }) => {
        const path = join(paths.generatedFiles, docId, `${page.pageNumber}`, 'pageImage.jpg');
        return FileSystemStatic.putFile(path, body, { encoding: 'binary' });
    });
};

export const indexPage = (indexDocument: IndexDocument, page: DocuvisionClient.Page): Promise<any[]> => {
    const { pages, ...document } = indexDocument.document;
    void [pages];

    const body: IndexPage = {
        ...indexDocument,
        id: `${indexDocument.id}/${page.pageNumber}`,
        document,
        page,
    };

    return Promise.all([getPageImage(page, indexDocument.document.id).catch(logError), esClient.index({ body }).catch(logError)]);
};
