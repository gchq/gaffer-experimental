import { Graph } from '../../domain/graph';
import { GraphType } from '../../domain/graph-type';
import { IApiResponse, RestClient } from '../clients/rest-client';
import { Config } from '../config';
import { IAllGraphsResponse, IGraphByIdResponse } from '../http-message-interfaces/response-interfaces';

export class GetAllGraphsRepo {
    public async getAll(): Promise<Graph[]> {
        const response: IApiResponse<IAllGraphsResponse> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .graphs()
            .execute();
        return response.data.graphs.map(
            (jsonObject: IGraphByIdResponse) =>
                new Graph(
                    jsonObject.graphId,
                    jsonObject.description,
                    jsonObject.url,
                    jsonObject.status,
                    jsonObject.configName,
                    GraphType.GAAS_GRAPH
                )
        );
    }
}
