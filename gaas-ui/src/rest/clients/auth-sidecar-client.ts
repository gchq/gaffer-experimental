import axios, { AxiosError, AxiosResponse } from "axios";
import { Config } from "../config";
import { RestClient } from "./rest-client";

export class AuthSidecarClient {
    private whatAuthObject: object;
    private token: string;
    private whoami: object;
    public constructor() {
        this.whatAuthObject = {};
        this.token = "";
        this.whoami = {};
    }
    public async getWhatAuth() {
        try {
            const response: AxiosResponse<any> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/what-auth",
                method: "GET",
            });
            this.whatAuthObject = response.data;
            return response.data;
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
    }
    public async getWhoAmI() {
        try {
            const response: AxiosResponse<any> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/whoami",
                method: "GET",
            });
            this.whoami = response.data;
            return response.data;
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
    }
    public async postAuth(data: object) {
        try {
            const response: AxiosResponse<any> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/auth",
                method: "POST",
                data: data,
            });
            this.token = response.data;
            return response.data;
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
    }
}
