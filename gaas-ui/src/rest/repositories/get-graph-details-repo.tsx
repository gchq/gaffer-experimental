import {IApiResponse, RestClient} from "../clients/rest-client";

export class GetGraphDetailsRepo {
    public async getDescription(proxyURLValue: string): Promise<string> {
        const response : IApiResponse<string> = await new RestClient()
            .get()
            .description()
            .execute(proxyURLValue);

        return response.data;
    }
    }