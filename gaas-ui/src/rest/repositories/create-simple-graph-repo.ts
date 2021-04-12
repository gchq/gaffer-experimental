import { StoreType } from "../../domain/store-type";
import { RestClient } from "../clients/rest-client";
import { ICreateSimpleGraphRequestBody } from "../http-message-interfaces/request-interfaces";
import {Graph} from "../../domain/graph";

export class CreateSimpleGraphRepo {
    public async create(
        graphId: string,
        description: string,
        storeType: StoreType,
        proxyStores: Graph[],
        root: string
    ): Promise<void> {
        const httpRequestBody: ICreateSimpleGraphRequestBody = {
            graphId: graphId,
            description: description,
            storeType: storeType,
            proxyStores: proxyStores,
            root: root,
        };

        await new RestClient().post().graphs().requestBody(httpRequestBody).execute();
    }
}
