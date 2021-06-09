import {IApiResponse, RestClient} from "../clients/rest-client";
import { Config } from "../config";
import {IGetStoreTypesResponse} from "../http-message-interfaces/response-interfaces";

export class GetStoreTypesRepo {

    public async get(): Promise<Array<string>> {
        const response: IApiResponse<IGetStoreTypesResponse>= await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .uri("/storetypes")
            .execute();

        return response.data.storeTypes;
    }
}
