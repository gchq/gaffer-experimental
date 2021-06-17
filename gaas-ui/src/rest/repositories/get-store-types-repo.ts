import { keys } from "../../../server/users";
import StoreTypeSelect from "../../components/create-graph/storetype";
import {IApiResponse, RestClient} from "../clients/rest-client";
import { Config } from "../config";
import {IStoreTypes, IStoreTypesResponse} from "../http-message-interfaces/response-interfaces";

export class GetStoreTypesRepo {

    public async get(): Promise<IStoreTypes> {
        const response: IApiResponse<IStoreTypesResponse>= await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .uri("/storetypes")
            .execute();

        let federatedStores: string[];
        let otherStores: string[];
        response.data.storeTypes.forEach((storeType: Object )=>{
            for(const value of Object.values(storeType)){
                if(value[1] === "parameters" && value.includes("proxies")){
                    federatedStores.push()
                }
            }
        })
        return {storeTypes: [], federatedStoreTypes: []}  
    }
}
