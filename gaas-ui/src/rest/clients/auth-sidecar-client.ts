import axios, { AxiosError, AxiosResponse } from "axios";
import { Config } from "../config";
import { RestClient } from "./rest-client";

export class AuthSidecarClient {
    private whatAuthObject: object;
    public constructor() {
        this.whatAuthObject = {};
    }
    public async getWhatAuth() {
        try {
            const response: AxiosResponse<any> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/what-auth",
                method: "GET",
            });
            return response.data;
        } catch (error) {
            throw RestClient.fromError(error as AxiosError<any>);
        }
    }
}
