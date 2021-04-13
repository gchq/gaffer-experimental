import { RestClient } from "../clients/rest-client";

export class DeleteGraphRepo {
    public async delete(graphId: string): Promise<void> {
        await new RestClient().delete().graphs(graphId).execute();
    }
}
