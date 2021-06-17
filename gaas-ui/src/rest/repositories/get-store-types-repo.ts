import {IApiResponse, RestClient} from "../clients/rest-client";
import { Config } from "../config";
import {IStore, IStoreTypes, IStoreTypesResponse} from "../http-message-interfaces/response-interfaces";

export class GetStoreTypesRepo {

    public async get(): Promise<IStoreTypes> {
        const response: IApiResponse<IStoreTypesResponse>= await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .uri("/storetypes")
            .execute();

        const federatedStores: string[] = [];
        const otherStores: string[] = [];
        response.data.storeTypes.forEach((store: IStore) => {
            if(store.parameters.includes("proxies")) {
                federatedStores.push(store.name);
            } else {
                otherStores.push(store.name);
            }
        })
        return {storeTypes: otherStores, federatedStoreTypes: federatedStores}
    }
}
