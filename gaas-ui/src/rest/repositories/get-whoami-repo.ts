import { IApiResponse, RestClient } from "../clients/rest-client";
import { Config } from "../config";

export class GetWhoAmIRepo {
    public async getWhoAmI(): Promise<string> {
        const response: IApiResponse<string> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .whoAmI()
            .execute();
        const email = response.data;
        RestClient.setEmail(email);
        return email;
    }
}
