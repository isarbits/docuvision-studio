// string utils from 'typeorm/util/StringUtils';

export const dashCase = (str: string) => {
    return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, '$1-$3$2$4').toLowerCase();
};

export const titleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export const camelCase = (str: string) => {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, (_match: string, p1: string, p2: string, offset: number) => {
        if (offset === 0) {
            return p1;
        }
        if (p2) {
            return p2.toUpperCase();
        }
        return p1.toLowerCase();
    });
};

export const snakeCase = (str: string) => {
    if (!/[a-z]/.test(str)) {
        str = str.toLowerCase();
    }
    return str.replace(/[^a-z0-9]/g, (char, index, word) => {
        if (/[A-Z]/.test(char)) {
            if (!index || /[ _]/.test(word[index - 1])) {
                return char.toLowerCase();
            }
            return '_' + char.toLowerCase();
        }
        return '_';
    });
};
