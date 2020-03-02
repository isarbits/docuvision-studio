export type Docuvision = typeof docuvision;
export interface DocuvisionResult {
    _source: Docuvision;
    highlight: any;
    _id: string;
}
export interface DocuvisionHit extends Docuvision {
    highlight: any;
}

export type DocuvisionPage = typeof docuvisionPage;
export interface DocuvisionPageResult {
    _source: DocuvisionPage;
    highlight: any;
    _id: string;
}
export interface DocuvisionPageHit extends DocuvisionPage {
    highlight: any;
}

export type EsTypeOf<T = { type: string }> = T extends { type: infer U; b: infer U } ? U : never;

export const docuvision = {
    createdAt: {
        type: 'date',
    },
    document: {
        completedDate: {
            type: 'date',
        },
        filename: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        fromPage: {
            type: 'long',
        },
        id: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        pageCount: {
            type: 'long',
        },
        pages: {
            fullText: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            height: {
                type: 'long',
            },
            imgUrl: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            pageNumber: {
                type: 'long',
            },
            status: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            width: {
                type: 'long',
            },
            words: {
                angle: {
                    type: 'long',
                },
                bb: {
                    type: 'float',
                },
                text: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
            },
        },
        status: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        toPage: {
            type: 'long',
        },
        uploadedDate: {
            type: 'date',
        },
        url: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        warnings: {
            message: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
        },
    },
    error: {
        body: {
            message: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            statusCode: {
                type: 'long',
            },
        },
        completedDate: {
            type: 'date',
        },
        errors: {
            message: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
        },
        failed: {
            type: 'boolean',
        },
        filename: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        fromPage: {
            type: 'long',
        },
        id: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        pageCount: {
            type: 'long',
        },
        pages: {
            errors: {
                message: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
            },
            fullText: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            height: {
                type: 'long',
            },
            imgUrl: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            pageNumber: {
                type: 'long',
            },
            status: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
            width: {
                type: 'long',
            },
            words: {
                angle: {
                    type: 'long',
                },
                bb: {
                    type: 'float',
                },
                text: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
            },
        },
        status: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        statusCode: {
            type: 'long',
        },
        text: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        toPage: {
            type: 'long',
        },
        uploadedDate: {
            type: 'date',
        },
        url: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        warnings: {
            message: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
        },
    },
    id: {
        type: 'text',
        fields: {
            keyword: {
                type: 'keyword',
                ignore_above: 256,
            },
        },
    },
    processingTime: {
        type: 'long',
    },
    upload: {
        extension: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        filename: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        folder: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        path: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        size: {
            type: 'long',
        },
    },
};

export const docuvisionPage = {
    createdAt: {
        type: 'date',
    },
    document: {
        completedDate: {
            type: 'date',
        },
        filename: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        fromPage: {
            type: 'long',
        },
        id: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        pageCount: {
            type: 'long',
        },
        status: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        toPage: {
            type: 'long',
        },
        uploadedDate: {
            type: 'date',
        },
        url: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        warnings: {
            message: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
        },
    },
    id: {
        type: 'text',
        fields: {
            keyword: {
                type: 'keyword',
                ignore_above: 256,
            },
        },
    },
    page: {
        fullText: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        height: {
            type: 'long',
        },
        imgUrl: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        pageNumber: {
            type: 'long',
        },
        status: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        width: {
            type: 'long',
        },
        words: {
            angle: {
                type: 'long',
            },
            bb: {
                type: 'float',
            },
            text: {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            },
        },
    },
    processingTime: {
        type: 'long',
    },
    upload: {
        extension: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        filename: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        folder: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        path: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        size: {
            type: 'long',
        },
    },
};
