const docuvision = require('./docuvision.json').docuvision.mappings._doc;
const docuvision_page = require('./docuvision_page.json').docuvision_page.mappings._doc;

const mapKeys = (obj) => {
    if (typeof obj !== 'object') {
        return obj;
    }
    return Object.entries(obj).reduce((ret, [key, value]) => {
        if (key === 'properties') {
            return { ...ret, ...mapKeys(value) };
        }
        ret[key] = mapKeys(value);
        return ret;
    }, {});
}


const docObj = JSON.stringify(mapKeys(docuvision), null, 4);
const pageObj = JSON.stringify(mapKeys(docuvision_page), null, 4);

const template = `\
export type Docuvision = typeof docuvision;
export interface DocuvisionResult { _source: Docuvision; highlight: any; _id: string; }
export interface DocuvisionHit extends Docuvision { highlight: any; }

export type DocuvisionPage = typeof docuvisionPage;
export interface DocuvisionPageResult { _source: DocuvisionPage; highlight: any; _id: string; }
export interface DocuvisionPageHit extends DocuvisionPage { highlight: any; }

export type EsTypeOf<T = { type: string }> = T extends { type: infer U, b: infer U } ? U : never;

export const docuvision = ${docObj};

export const docuvisionPage = ${pageObj};
`;
require('fs').writeFileSync('./interfaces.ts', template);
