import { StoreType } from "../../domain/store-type";
import { RestClient } from "../clients/rest-client";
import { ICreateFederatedRequestBody, ICreateSimpleGraphRequestBody } from "../http-message-interfaces/request-interfaces";
import {Graph} from "../../domain/graph";
import {IElements} from "../../domain/elements-schema";
import {ITypesSchema} from "../../domain/types-schema";


export class CreateSimpleGraphRepo {
    public async create(
        graphId: string,
        description: string,
        storeType: StoreType,
        proxyStores: Graph[],
        schema: {
            elements: IElements;
            types: ITypesSchema;
        },
        root: string
    ): Promise<void> {
        const httpRequestBody: ICreateSimpleGraphRequestBody = {
            graphId: graphId,
            description: description,
            storeType: storeType,
            proxyStores: proxyStores,
            schema: schema,
            root: root
        };

    
        await new RestClient().post().graphs().requestBody(httpRequestBody).execute();
    }
    public async createFederated(
        graphId: string,
        description: string,
        storeType: StoreType,
        proxyStores: Graph[],
        root: string
    ): Promise<void> {
        const httpRequestBody: ICreateFederatedRequestBody = {
            graphId: graphId,
            description: description,
            storeType: storeType,
            proxyStores: proxyStores,
            root: root
        };
        await new RestClient().post().graphs().requestBody(httpRequestBody).execute();
    };
}
