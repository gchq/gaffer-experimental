import { Graph } from "../../domain/graph";
import { GraphType } from "../../domain/graph-type";
import { StoreType } from "../../domain/store-type";
import { IApiResponse, RestClient } from "../clients/rest-client";
import {
  IAllGraphsResponse,
  IGraphByIdResponse,
} from "../http-message-interfaces/response-interfaces";

export class GetAllGraphsRepo {
  public async getAll(): Promise<Graph[]> {
    const response: IApiResponse<IAllGraphsResponse> = await new RestClient()
      .get()
      .graphs()
      .execute();

    return response.data.map((jsonObject: IGraphByIdResponse) =>
        new Graph(
          jsonObject.graphId,
          jsonObject.description,
          jsonObject.url,
          jsonObject.status,
          StoreType[jsonObject.storeType],
          GraphType.GAAS_GRAPH
        )
    );
  }
}
