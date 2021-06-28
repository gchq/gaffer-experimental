import {StoreType} from "../../domain/store-type";
import {RestClient} from "../clients/rest-client";
import {ICreateFederatedGraphRequestBody, ICreateGraphRequestBody} from "../http-message-interfaces/request-interfaces";
import {IElements} from "../../domain/elements-schema";
import {ITypesSchema} from "../../domain/types-schema";
import { Config } from "../config";

export class CreateGraphRepo {
    public async create(
        graphId: string,
        description: string,
        storeType: StoreType,
        config: ICreateGraphConfig,
    ): Promise<void> {
        if (storeType === StoreType.ACCUMULO || storeType === StoreType.MAPSTORE) {
            if (config.schema === undefined) {
                throw new Error("Schema is undefined");
            }
            const httpRequestBody: ICreateGraphRequestBody = {
                graphId: graphId,
                description: description,
                storeType: storeType,
                schema: config.schema,
            };
            await new RestClient().baseUrl(Config.REACT_APP_KAI_REST_API_HOST).post().graphs().requestBody(httpRequestBody).execute();
        }
        
        else {
            if (config.proxyStores === undefined) {
                throw new Error("Proxy Stores is undefined");
            }
            const httpRequestBody: ICreateFederatedGraphRequestBody = {
                graphId: graphId,
                description: description,
                storeType: StoreType.FEDERATED_STORE,
                proxyStores: config.proxyStores
            };
            await new RestClient().baseUrl(Config.REACT_APP_KAI_REST_API_HOST).post().graphs().requestBody(httpRequestBody).execute();
        }
    }
}

export interface ICreateGraphConfig {
    schema?: {
        elements: IElements;
        types: ITypesSchema;
    };
    proxyContextRoot?: string;
    proxyHost?: string;
    proxyStores?: Array<{ graphId: string, url: string }>;
}
