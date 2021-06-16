import { Graph } from "../../domain/graph";
import { GraphType } from "../../domain/graph-type";
import { IApiResponse, RestClient } from "../clients/rest-client";
import { Config } from "../config";
import { IGraphByIdResponse } from "../http-message-interfaces/response-interfaces";

export class GetGraphRepo {
  public async get(graphId: string): Promise<Graph> {
    const response: IApiResponse<IGraphByIdResponse> = await new RestClient()
      .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
      .get()
      .graphs(graphId)
      .execute();

    return new Graph(
      response.data.graphId,
      response.data.description,
      response.data.url,
      response.data.status,
      response.data.storeType,
      GraphType.GAAS_GRAPH
    );
  }
}
