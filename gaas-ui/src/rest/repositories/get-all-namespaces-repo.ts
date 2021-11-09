import { IApiResponse, RestClient } from '../clients/rest-client';
import { Config } from '../config';
import { IAllNameSpacesResponse } from '../http-message-interfaces/response-interfaces';

export class GetAllNamespacesRepo {
    public async getAll(): Promise<string[]> {
        const response: IApiResponse<IAllNameSpacesResponse> = await new RestClient()
            .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
            .get()
            .namespaces()
            .execute();

        return response.data;
    }
}
