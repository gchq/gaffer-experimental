import { IApiResponse, RestClient } from '../clients/rest-client';

export class DeleteGraphRepo {
    public async delete(graphId: string): Promise<void> {
        const response: IApiResponse<undefined> = await new RestClient().delete().graphs(graphId).execute();

        if (response.status !== 204) {
            throw new Error(`Expected status code 204 for Accepted Delete Graph Process but got (${response.status})`);
        }
    }
}
