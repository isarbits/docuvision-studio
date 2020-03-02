/* eslint-disable @typescript-eslint/camelcase */
const STRINGS = {
    errors_login_invalid: 'Invalid email or password',
    errors_example_exception: 'Example error',
};
/* eslint-enable @typescript-eslint/camelcase */

// basically just returns STRINGS[key] || key
// if value doesn't exist, just return the key
const handler = {
    get(target, symbol, _receiver) {
        return target[symbol] || symbol;
        if (typeof target[symbol] === 'string') {
            return target[symbol] || symbol;
        }
        return symbol;
    },
};
export const strings: typeof STRINGS & { [key: string]: any } = new Proxy(STRINGS, handler);
