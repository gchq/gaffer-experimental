import {RestClient} from "../clients/rest-client";
import {ICreateFederatedGraphRequestBody, ICreateGraphRequestBody} from "../http-message-interfaces/request-interfaces";
import { Config } from "../config";
import { ICreateGraphConfig } from "./create-storetypes-graph-repo";

export class CreateFederatedGraphRepo {
    public async create(
        graphId: string,
        description: string,
        storeType: string,
        config: ICreateGraphConfig,
    ): Promise<void> {
        if (config.proxyStores === undefined) {
            throw new Error("Proxy Stores is undefined");
        }
        const httpRequestBody: ICreateFederatedGraphRequestBody = {
            graphId: graphId,
            description: description,
            storeType: storeType,
            proxyStores: config.proxyStores
        };
        await new RestClient().baseUrl(Config.REACT_APP_KAI_REST_API_HOST).post().graphs().requestBody(httpRequestBody).execute();
    
       
        }
}

