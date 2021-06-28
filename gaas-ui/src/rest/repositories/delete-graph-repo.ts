import { RestClient } from "../clients/rest-client";
import { Config } from "../config";

export class DeleteGraphRepo {
  public async delete(graphId: string): Promise<void> {
    await new RestClient()
      .baseUrl(Config.REACT_APP_KAI_REST_API_HOST)
      .delete()
      .graphs(graphId)
      .execute();
  }
}
