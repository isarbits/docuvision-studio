// import { paths } from 'config';
import { Docuvision } from 'interfaces';
// import { join } from 'path';
import { StudioClient } from '../../api/client';
import { logError } from '../../logging/es-log';
// import { FileSystemStatic } from '../../storage/filesystem';
import { IndexDocument, IndexPage } from '../index.d';

const studioClient = new StudioClient();

const getPageImage = (page: Docuvision.Page, docId: string) => {
    return studioClient.download(docId, page.pageNumber, 'image')/*.then(
        ({ body }) => {
            const path = join(paths.generatedFiles, docId, `${page.pageNumber}`, 'pageImage.jpg');
            return FileSystemStatic.putFile(path, body, { encoding: 'binary' });
        }
    );*/
};

export const indexPage = (indexDocument: IndexDocument, page: Docuvision.Page): Promise<any[]> => {
    const { pages, ...document } = indexDocument.document;
    void [pages];

    const body: IndexPage = {
        ...indexDocument,
        id: `${indexDocument.id}/${page.pageNumber}`,
        document,
        page,
    };

    return Promise.all([getPageImage(page, indexDocument.document.id).catch(logError), studioClient.indexPage(body).catch(logError)]);
};
