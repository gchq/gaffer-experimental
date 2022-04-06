import axios from "axios";
import { Config } from "../config";
import { RestClient } from "./rest-client";

export class AuthSidecarClient {
    private whatAuthObject: object;
    public constructor() {
        this.whatAuthObject = {};
    }
    public async getWhatAuth() {
        await axios
            .get(Config.REACT_APP_AUTH_ENDPOINT + "/what-auth")
            .then((response) => {
                this.whatAuthObject = response.data;
                console.log(response.data);
            })
            .catch((error) => {
                throw RestClient.fromError(error);
            });
    }
}
