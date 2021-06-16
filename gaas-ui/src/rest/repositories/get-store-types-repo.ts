import {IApiResponse, RestClient} from "../clients/rest-client";
import { Config } from "../config";
import {IStoreTypesResponse} from "../http-message-interfaces/response-interfaces";

export class GetStoreTypesRepo {

    public async get(): Promise<IStoreTypesResponse> {
        const response: IApiResponse<IStoreTypesResponse>= await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .uri("/storetypes")
            .execute();

        return response.data;
    }
}
