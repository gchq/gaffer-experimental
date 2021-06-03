import { RestClient } from "../../clients/rest-client";

export class GetAllGraphIdsRepo {
  public async get(graphHost: string): Promise<Array<string>> {
    const getAllGraphIdsRequestBody = {
      class: "uk.gov.gchq.gaffer.federatedstore.operation.GetAllGraphIds",
    };

    const response = await new RestClient()
      .baseUrl(graphHost)
      .urlPath("/graph/operations/execute")
      .post()
      .requestBody(getAllGraphIdsRequestBody)
      .execute();

    return response.data;
  }
}
