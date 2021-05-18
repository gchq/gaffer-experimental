import {IApiResponse, RestClient} from "../clients/rest-client";
import {IGraphResponse} from "../http-message-interfaces/response-interfaces";

export class GetGraphStatusRepo {
    public async checkStatus(proxyURLValue: string): Promise<string>{
        const response : IApiResponse<IGraphResponse> = await new RestClient()
            .get()
            .status()
            .execute(proxyURLValue);

        return response.data.status;
    }
}