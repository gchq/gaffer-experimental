import { RestClient } from "../clients/rest-client";
import { ICreateFederatedGraphRequestBody } from "../http-message-interfaces/request-interfaces";
import { Config } from "../config";
import { ICreateGraphConfig } from "./create-storetypes-graph-repo";

export class CreateFederatedGraphRepo {
    public async create(
        graphId: string,
        description: string,
        configName: string,
        config: ICreateGraphConfig
    ): Promise<void> {
        if (config.proxySubGraphs === undefined) {
            throw new Error("Proxy Stores is undefined");
        }
        const httpRequestBody: ICreateFederatedGraphRequestBody = {
            graphId: graphId,
            description: description,
            configName: configName,
            proxySubGraphs: config.proxySubGraphs,
        };
        await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .post()
            .requestBody(httpRequestBody)
            .graphs()
            .execute();
    }
}
