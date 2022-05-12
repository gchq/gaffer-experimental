import { IApiResponse, RestClient } from "./rest-client";
import { Config } from "../config";
import axios, { AxiosError } from "axios";

export class OpenshiftClient {
    public async getWhoAmI(): Promise<string> {
        try {
            const response: IApiResponse<string> = await axios({
                baseURL: Config.REACT_APP_AUTH_ENDPOINT,
                url: "/whoami",
                method: "get",
                headers: {},
                data: undefined,
                withCredentials: true,
            });
            const email = response.data;
            RestClient.setEmail(email);
            return email;
        } catch (e) {
            const error = e as AxiosError;
            throw RestClient.fromError(error);
        }
    }
}
