import { Search } from './search';
import { elastic } from 'config';

export const SearchManager = new (class SearchManager {
    public clients: { [key: string]: Search } = {};

    public getClient({ index, node }: { index: string; node: string }) {
        if (!this.clients[index]) {
            this.clients[index] = new Search({
                node: node || elastic.node,
                index: index || elastic.index,
            });
        }

        return this.clients[index];
    }
})();
