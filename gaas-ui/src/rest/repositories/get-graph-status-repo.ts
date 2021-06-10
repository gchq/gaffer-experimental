import {IApiResponse, RestClient} from "../clients/rest-client";
import {IGraphStatusResponse} from "../http-message-interfaces/response-interfaces";

export class GetGraphStatusRepo {
    public async getStatus(proxiedGraphBaseUrl: string): Promise<string>{
        const response : IApiResponse<IGraphStatusResponse> = await new RestClient()
            .baseUrl(proxiedGraphBaseUrl)
            .get()
            .status()
            .execute();

        return response.data.status;
    }
}
