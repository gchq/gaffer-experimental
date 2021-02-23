import { RestClient, IApiResponse } from '../clients/rest-client';

export class DeleteGraphRepo {
    public async delete(graphId: string): Promise<void> {
        const response: IApiResponse<undefined> = await RestClient.delete(graphId);

        if (response.status !== 204) {
            throw new Error(`Expected status code 204 for Accepted Delete Graph Process but got (${response.status})`);
        }
    }
}
