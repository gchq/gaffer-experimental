import axios, { AxiosError, AxiosResponse } from 'axios';
import status from 'statuses';
import { GaaSRestApiErrorResponse } from '../http-message-interfaces/error-response-interface';
import { RestApiError } from '../RestApiError';
import { Config } from './../config';

export class RestClient {
    private static jwtToken: string;

    public static setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }
    public static async get(pathVariable?: string): Promise<IApiResponse> {
        const path = pathVariable ? `/${pathVariable}` : ``;

        try {
            const response: AxiosResponse<any> = await axios.get(`/graphs${path}`, {
                baseURL: Config.REACT_APP_KAI_REST_API_HOST,
                headers: { Authorization: 'Bearer ' + this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw this.fromError(e);
        }
    };
    public static async getNamespaces(): Promise<IApiResponse> {

        try {
            const response: AxiosResponse<any> = await axios.get(`/namespaces`, {
                baseURL: Config.REACT_APP_KAI_REST_API_HOST,
                headers: { Authorization: 'Bearer ' + this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw this.fromError(e);
        }
    }

    public static async post(httpRequestBody: object): Promise<IApiResponse> {
        try {
            const response: AxiosResponse<any> = await axios.post(`/graphs`, httpRequestBody, {
                baseURL: Config.REACT_APP_KAI_REST_API_HOST,
                headers: { Authorization: 'Bearer ' + this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw this.fromError(e);
        }
    }

    public static async delete(urlPathVariable: string): Promise<IApiResponse> {
        try {
            const response: AxiosResponse<any> = await axios.delete(`/graphs/${urlPathVariable}`, {
                baseURL: Config.REACT_APP_KAI_REST_API_HOST,
                headers: { Authorization: 'Bearer ' + this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw this.fromError(e);
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
