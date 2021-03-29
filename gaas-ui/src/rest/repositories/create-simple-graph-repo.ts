import { StoreType } from "../../domain/store-type";
import { RestClient } from "../clients/rest-client";
import { ICreateSimpleGraphRequestBody } from "../http-message-interfaces/request-interfaces";

export class CreateSimpleGraphRepo {
    public async create(graphId: string, description: string, storeType: StoreType, url: string, root: string): Promise<void> {
        const httpRequestBody: ICreateSimpleGraphRequestBody = {
            graphId: graphId,
            description: description,
            storeType: storeType,
            url: url,
            root: root,
        };

        await new RestClient().post().graphs().requestBody(httpRequestBody).execute();
    }
}
