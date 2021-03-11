import {IApiResponse, RestClient} from "../clients/rest-client";
import {IAllNameSpacesResponse} from "../http-message-interfaces/response-interfaces";

export class GetAllNamespacesRepo {
    public async getAll(): Promise<Array<string>> {
        const response: IApiResponse<IAllNameSpacesResponse> = await RestClient.getNamespaces();
        return response.data;
    }
}