import { IApiResponse, RestClient } from "../clients/rest-client";

export class GetGraphIdRepo {
    public async getGraphId(proxiedGraphBaseUrl: string): Promise<string> {
        const response : IApiResponse<string> = await new RestClient()
            .baseUrl(proxiedGraphBaseUrl)
            .get()
            .graphId()
            .execute();
        return response.data;
    }
}