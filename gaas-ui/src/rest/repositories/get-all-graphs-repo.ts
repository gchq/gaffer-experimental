import { RestClient, IApiResponse } from '../clients/rest-client';
import { IAllGraphsResponse } from '../http-message-interfaces/response-interfaces';
import { Graph } from '../../domain/graph';

export class GetAllGraphsRepo {
    public async getAll(): Promise<Graph[]> {
        const response: IApiResponse<IAllGraphsResponse> = await RestClient.get();

        return response.data.map((jsonObject: any) => {
            console.log(jsonObject.graphId)
            return new Graph(jsonObject.graphId, jsonObject.description);
        });
    }
}
