import { IApiResponse, RestClient } from "../clients/rest-client";
import { Config } from "../config";
import { IWhoAmIResponse } from "../http-message-interfaces/response-interfaces";

export class GetWhoAmIRepo {
    public async getWhoAmI(): Promise<string> {
        const response: IApiResponse<IWhoAmIResponse> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .whoAmI()
            .execute();
        const email = response.data["x-email"];
        RestClient.setEmail(email);
        return email;
    }
}
