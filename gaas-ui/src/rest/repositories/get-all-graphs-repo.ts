import { Graph } from "../../domain/graph";
import { GraphType } from "../../domain/graph-type";
import { IApiResponse, RestClient } from "../clients/rest-client";
import { IAllGraphsResponse } from "../http-message-interfaces/response-interfaces";

export class GetAllGraphsRepo {
    public async getAll(): Promise<Graph[]> {
        const response: IApiResponse<IAllGraphsResponse> = await new RestClient().get().graphs().execute();

        return response.data.map((jsonObject: any) => new Graph(jsonObject.graphId, jsonObject.description, jsonObject.url, jsonObject.status, GraphType.GAAS_GRAPH));
    }
}
