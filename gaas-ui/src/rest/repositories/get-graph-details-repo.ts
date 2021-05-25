import { IApiResponse, RestClient } from "../clients/rest-client";

export class GetGraphDetailsRepo {
    public async getDescription(proxiedGraphUrl: string): Promise<string> {
        const response : IApiResponse<string> = await new RestClient()
            .baseUrl(proxiedGraphUrl)
            .get()
            .description()
            .execute();

        return response.data;
    }
}
