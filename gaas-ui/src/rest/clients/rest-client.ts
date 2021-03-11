import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import status from 'statuses';
import { GaaSRestApiErrorResponse } from '../http-message-interfaces/error-response-interface';
import { RestApiError } from '../RestApiError';
import { Config } from './../config';

export class RestClient {
    private static jwtToken: string;

    public static setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }

    private url: string;
    private method: Method;
    private data: object;
    constructor() {
        this.url = '';
        this.method = 'get';
        this.data = {};
    }

    public get(): RestClient {
        this.method = 'get';
        return this;
    }

    public graphs(pathVariable?: string): RestClient {
        const _pathVariable = pathVariable ? `/${pathVariable}` : ``;
        this.url = `/graphs${_pathVariable}`;
        return this;
    }

    public namespaces(): RestClient {
        this.url = '/namespaces';
        return this;
    }

    public authentication(): RestClient {
        this.url = '/auth';
        return this;
    }

    public post(): RestClient {
        this.method = 'post';
        return this;
    }

    public delete(): RestClient {
        this.method = 'delete';
        return this;
    }

    public requestBody(requestBody: object): RestClient {
        this.data = requestBody;
        console.log(this.data)
        return this;
    }

    public async execute(): Promise<IApiResponse> {
        try {
            const response: AxiosResponse<any> = await axios({
                url: this.url,
                method: this.method,
                baseURL: Config.REACT_APP_KAI_REST_API_HOST,
                headers: { Authorization: 'Bearer ' + RestClient.jwtToken },
                data: this.data,
                responseType: 'json',
            });
            return RestClient.convert(response);
        } catch (e) {
            throw RestClient.fromError(e);
        }
    }

    private static fromError(e: AxiosError<GaaSRestApiErrorResponse>): RestApiError {
        if (e.response && e.response.data) {
            return new RestApiError(e.response.data.title, e.response.data.detail);
        }
        if (e.response && e.response.status) {
            return new RestApiError(`Error Code ${e.response.status}`, status(e.response.status));
        }
        return new RestApiError('Unknown Error', 'Unable to make request');
    }

    private static async convert(response: AxiosResponse<any>): Promise<IApiResponse> {
        return {
            status: response.status,
            data: response.data,
        };
    }
}

export interface IApiResponse<T = any> {
    status: number;
    data: T;
}
