import { RestClient } from "../clients/rest-client";
import { Config } from "../config";

export class GetStoreTypesRepo {

    public async get(): Promise<Array<string>> {
        const response = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .urlPath("/storetypes")
            .get()
            .execute();

        return response.data;
    }
}
