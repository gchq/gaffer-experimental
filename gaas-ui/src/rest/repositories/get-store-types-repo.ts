import {IApiResponse, RestClient} from "../clients/rest-client";
import { Config } from "../config";
import {IAllStoreTypesResponse} from "../http-message-interfaces/response-interfaces";

export class GetStoreTypesRepo {

    public async get(): Promise<IAllStoreTypesResponse> {
        const response: IApiResponse<IAllStoreTypesResponse>= await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .urlPath("/storetypes")
            .get()
            .execute();

        return response.data;
    }
}
