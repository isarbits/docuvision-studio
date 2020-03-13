/**
 * JSONViewer - by Roman Makudera 2016 (c) MIT licence.
 * https://www.cssscript.com/minimal-json-data-formatter-jsonviewer/
 *
 * modified: p-mcgowan 2020
 */

export type JSON = { [key: string]: any } | { [key: string]: any }[];

export class JSONViewer {
    private _dom_container: any;
    private Object_prototype_toString = {}.toString;
    // eslint-disable-next-line
    private DatePrototypeAsString = this.Object_prototype_toString.call(new Date());

    /** @constructor */
    constructor(preElement: HTMLPreElement) {
        this._dom_container = preElement;
        this._dom_container.classList.add('json-viewer');
    }

    /**
     * Visualise JSON object.
     *
     * @param {Object|Array} json Input value
     * @param {Number} [inputMaxLvl] Process only to max level, where 0..n, -1 unlimited
     * @param {Number} [inputColAt] Collapse at level, swhere 0..n, -1 unlimited
     */
    showJSON(jsonValue: JSON, inputMaxLvl: number = -1, inputColAt: number = 1) {
        // Process only to maxLvl, where 0..n, -1 unlimited
        let maxLvl = typeof inputMaxLvl === 'number' ? inputMaxLvl : -1; // max level
        // Collapse at level colAt, where 0..n, -1 unlimited
        let colAt = typeof inputColAt === 'number' ? inputColAt : -1; // collapse at

        this._dom_container.innerHTML = '';
        this.walkJSONTree(this._dom_container, jsonValue, maxLvl, colAt, 0);
    }

    /**
     * Get container with pre object - this container is used for visualise JSON data.
     *
     * @return {Element}
     */
    getContainer() {
        return this._dom_container;
    }

    /**
     * Recursive walk for input value.
     *
     * @param {Element} outputParent is the Element that will contain the new DOM
     * @param {Object|Array} value Input value
     * @param {Number} maxLvl Process only to max level, where 0..n, -1 unlimited
     * @param {Number} colAt Collapse at level, where 0..n, -1 unlimited
     * @param {Number} lvl Current level
     */
    private walkJSONTree(outputParent, value, maxLvl, colAt, lvl) {
        let isDate = this.Object_prototype_toString.call(value) === this.DatePrototypeAsString;
        let realValue =
            !isDate && typeof value === 'object' && value !== null && 'toJSON' in value
                ? value.toJSON()
                : value;

        if (typeof realValue === 'object' && realValue !== null && !isDate) {
            let isMaxLvl = maxLvl >= 0 && lvl >= maxLvl;
            let isCollapse = colAt >= 0 && lvl >= colAt;

            let isArray = Array.isArray(realValue);
            let items = isArray ? realValue : Object.keys(realValue);

            if (lvl === 0) {
                // root level
                let rootCount = this._createItemsCount(items.length);
                // hide/show
                let rootLink = this._createLink(isArray ? '[' : '{');

                if (items.length) {
                    rootLink.addEventListener('click', function() {
                        if (isMaxLvl) return;

                        rootLink.classList.toggle('collapsed');
                        rootCount.classList.toggle('hide');

                        // main list
                        outputParent.querySelector('ul').classList.toggle('hide');
                    });

                    if (isCollapse) {
                        rootLink.classList.add('collapsed');
                        rootCount.classList.remove('hide');
                    }
                } else {
                    rootLink.classList.add('empty');
                }

                rootLink.appendChild(rootCount);
                outputParent.appendChild(rootLink); // output the rootLink
            }

            if (items.length && !isMaxLvl) {
                let len = items.length - 1;
                let ulList = document.createElement('ul');
                ulList.setAttribute('data-level', lvl);
                ulList.classList.add('type-' + (isArray ? 'array' : 'object'));

                items.forEach((key, ind) => {
                    let item = isArray ? key : value[key];
                    let li = document.createElement('li');

                    if (typeof item === 'object') {
                        // null && date
                        if (!item || item instanceof Date) {
                            li.appendChild(document.createTextNode(isArray ? ' : key + ' : ''));
                            li.appendChild(this.createSimpleViewOf(item ? item : null, true));
                        }
                        // array & object
                        else {
                            let itemIsArray = Array.isArray(item);
                            let itemLen = itemIsArray ? item.length : Object.keys(item).length;

                            // empty
                            if (!itemLen) {
                                li.appendChild(
                                    document.createTextNode(
                                        key + ': ' + (itemIsArray ? '[]' : '{}'),
                                    ),
                                );
                            } else {
                                // 1+ items
                                let itemTitle =
                                    (typeof key === 'string' ? key + ': ' : '') +
                                    (itemIsArray ? '[' : '{');
                                let itemLink = this._createLink(itemTitle);
                                let itemsCount = this._createItemsCount(itemLen);

                                // maxLvl - only text, no link
                                if (maxLvl >= 0 && lvl + 1 >= maxLvl) {
                                    li.appendChild(document.createTextNode(itemTitle));
                                } else {
                                    itemLink.appendChild(itemsCount);
                                    li.appendChild(itemLink);
                                }

                                this.walkJSONTree(li, item, maxLvl, colAt, lvl + 1);
                                li.appendChild(document.createTextNode(itemIsArray ? ']' : '}'));

                                let list = li.querySelector('ul');
                                let itemLinkCb = () => {
                                    itemLink.classList.toggle('collapsed');
                                    itemsCount.classList.toggle('hide');
                                    list?.classList.toggle('hide');
                                };

                                // hide/show
                                itemLink.addEventListener('click', itemLinkCb);

                                // collapse lower level
                                if (colAt >= 0 && lvl + 1 >= colAt) {
                                    itemLinkCb();
                                }
                            }
                        }
                    }
                    // simple values
                    else {
                        // object keys with key:
                        if (!isArray) {
                            li.appendChild(document.createTextNode(key + ': '));
                        }

                        // recursive
                        this.walkJSONTree(li, item, maxLvl, colAt, lvl + 1);
                    }

                    // add comma to the end
                    if (ind < len) {
                        li.appendChild(document.createTextNode(','));
                    }

                    ulList.appendChild(li);
                });

                outputParent.appendChild(ulList); // output ulList
            } else if (items.length && isMaxLvl) {
                let itemsCount = this._createItemsCount(items.length);
                itemsCount.classList.remove('hide');

                outputParent.appendChild(itemsCount); // output itemsCount
            }

            if (lvl === 0) {
                // empty root
                if (!items.length) {
                    let itemsCount = this._createItemsCount(0);
                    itemsCount.classList.remove('hide');

                    outputParent.appendChild(itemsCount); // output itemsCount
                }

                // root cover
                outputParent.appendChild(document.createTextNode(isArray ? ']' : '}'));

                // collapse
                if (isCollapse) {
                    outputParent.querySelector('ul').classList.add('hide');
                }
            }
        } else {
            // simple values
            outputParent.appendChild(this.createSimpleViewOf(value, isDate));
        }
    }

    /**
     * Create simple value (no object|array).
     *
     * @param    {Number|String|null|undefined|Date} value Input value
     * @return {Element}
     */
    private createSimpleViewOf(value, isDate) {
        let spanEl = document.createElement('span');
        let type: any = typeof value;
        let asText = `${value}`;
        if (type === 'string') {
            asText = `"${value}"`;
        } else if (value === null) {
            type = 'null';
            //asText = "null";
        } else if (isDate) {
            type = 'date';
            asText = value.toLocaleString();
        }
        spanEl.className = 'type-' + type;
        spanEl.textContent = asText;
        return spanEl;
    }

    /**
     * Create items count element.
     *
     * @param    {Number} count Items count
     * @return {Element}
     */
    private _createItemsCount(count) {
        let itemsCount = document.createElement('span');
        itemsCount.className = 'items-ph hide';
        itemsCount.innerHTML = this._getItemsTitle(count);

        return itemsCount;
    }

    /**
     * Create clickable link.
     *
     * @param    {String} title Link title
     * @return {Element}
     */
    private _createLink(title) {
        let linkEl = document.createElement('a');
        linkEl.classList.add('list-link');
        // eslint-disable-next-line
        linkEl.href = 'javascript:void(0)';
        linkEl.innerHTML = title || '';

        return linkEl;
    }

    /**
     * Get correct item|s title for count.
     *
     * @param    {Number} count Items count
     * @return {String}
     */
    private _getItemsTitle(count) {
        let itemsTxt = count > 1 || count === 0 ? 'items' : 'item';

        return count + ' ' + itemsTxt;
    }
}
