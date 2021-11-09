import { IApiResponse, RestClient } from '../clients/rest-client';

export class GetGraphDetailsRepo {
    public async getDescription(proxiedGraphBaseUrl: string): Promise<string> {
        const response: IApiResponse<string> = await new RestClient()
            .baseUrl(proxiedGraphBaseUrl)
            .get()
            .description()
            .execute();

        return response.data;
    }
}
