import superagent from 'superagent';

export module DocuvisionClient {
    export interface ApiResponse<T = any> extends superagent.Response {
        body: T;
    }

    export interface ClientConfig {
        host?: string;
        apiKey?: string;
    }

    export interface Word {
        text: string;
        bb: [number, number, number, number];
        angle: number;
    }

    export interface Page {
        pageNumber: number;
        status: string;
        errors: string;
        height: number;
        width: number;
        fullText: string;
        words: Word[];
        imgUrl: string;
    }

    export interface Document {
        id: string;
        url: string;
        status: string;
        filename: string;
        mimeType: string;
        errors: string;
        warnings: string;
        uploadedDate: number;
        completedDate: number;
        pages: Page[];
        pageCount: number;
        fromPage: number;
        toPage: number;
    }

    export interface UploadRequest {
        file: string;
    }

    export type UploadResponse = ApiResponse<{
        id: string;
        status: string;
        url: string;
    }>;

    export interface GetDocumentRequest {
        id: string;
        fromPage?: number;
        toPage?: number;
    }

    export type GetDocumentResponse = ApiResponse<Document>;

    export interface ListDocumentsRequest {
        offset?: number;
        limit?: number;
    }

    export type ListDocumentsResponse = ApiResponse<{
        offset: number;
        limit: number;
        total: number;
        data: Document[];
    }>;

    export interface DeleteDocumentRequest {
        docId: string;
    }

    export type DeleteDocumentResponse = ApiResponse<boolean>;

    export interface GetDocumentPageImageRequest {
        documentId: string;
        pageNum: number;
    }

    export type GetDocumentPageImageResponse = ApiResponse<Buffer>;
}

/*
 * THIS FILE IS AUTO GENERATED
 * edit if you want
 */

/* tslint:disable */
// import { send } from './api';

// type ApiData = any;

// export const Client = {
//     getV1Ping: (data?: ApiData) => send('get', `/v1/ping`, data),
//     postV1DocumentUpload: (data?: ApiData) => send('post', `/v1/document/upload`, data),
//     getV1DocumentDocumentId: (documentId: string, data?: ApiData) => send('get', `/v1/document/${documentId}`, data),
//     getv1DocumentDocumentIdPageNumberJpg: (documentId: string, pageNumber: string, data?: ApiData) => send('get', `v1/document/${documentId}/${pageNumber}.jpg`, data),
//     getv1DocumentDocumentIdPageIdActivities: (documentId: string, pageId: string, data?: ApiData) => send('get', `v1/document/${documentId}/${pageId}/activities`, data),
//     getV1Document: (data?: ApiData) => send('get', `/v1/document`, data),
//     deleteV1DocumentDocumentId: (documentId: string, data?: ApiData) => send('delete', `/v1/document/${documentId}`, data),
// };

// export const deprecated = {
//     getError: (data?: ApiData) => send('get', `/error`, data),
//     getLinks: (data?: ApiData) => send('get', `/links`, data),
//     postApiKeysCreate: (data?: ApiData) => send('post', `/api-keys/create`, data),
//     getApiKeysApiKeyId: (apiKeyId: string, data?: ApiData) => send('get', `/api-keys/${apiKeyId}`, data),
//     postApiKeys: (data?: ApiData) => send('post', `/api-keys`, data),
//     deleteApiKeysApiKeyId: (apiKeyId: string, data?: ApiData) => send('delete', `/api-keys/${apiKeyId}`, data),
//     postAuthLogin: (data?: ApiData) => send('post', `/auth/login`, data),
//     postAuthSelfRegisterStep1: (data?: ApiData) => send('post', `/auth/self-register-step1`, data),
//     postAuthSelfRegisterStep2: (data?: ApiData) => send('post', `/auth/self-register-step2`, data),
//     postAuthRegisterStep1: (data?: ApiData) => send('post', `/auth/register-step1`, data),
//     postAuthRegisterStep2: (data?: ApiData) => send('post', `/auth/register-step2`, data),
//     postAuthRefreshToken: (data?: ApiData) => send('post', `/auth/refresh-token`, data),
//     postAuthForgotPassword: (data?: ApiData) => send('post', `/auth/forgot-password`, data),
//     postAuthChangePassword: (data?: ApiData) => send('post', `/auth/change-password`, data),
//     postAuthResetPassword: (data?: ApiData) => send('post', `/auth/reset-password`, data),
//     postAuthCreateInitialAdmin: (data?: ApiData) => send('post', `/auth/create-initial-admin`, data),
//     getUserUserId: (userId: string, data?: ApiData) => send('get', `/user/${userId}`, data),
//     getUser: (data?: ApiData) => send('get', `/user`, data),
//     putUserUserId: (userId: string, data?: ApiData) => send('put', `/user/${userId}`, data),
//     postUserUserIdActivities: (userId: string, data?: ApiData) => send('post', `/user/${userId}/activities`, data),
//     deleteUserUserId: (userId: string, data?: ApiData) => send('delete', `/user/${userId}`, data),
//     getDocumentDocumentIdOriginal: (documentId: string, data?: ApiData) => send('get', `/document/${documentId}/original`, data),
//     postQueueDeleteAllJobs: (data?: ApiData) => send('post', `/queue/delete-all-jobs`, data),
//     postQueueRecentDocuments: (data?: ApiData) => send('post', `/queue/recent-documents`, data),
// };
