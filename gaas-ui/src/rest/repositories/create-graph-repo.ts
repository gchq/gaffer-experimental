import { RestClient, IApiResponse } from '../clients/rest-client';
import { ICreateGraphRequestBody } from '../http-message-interfaces/request-interfaces';
import { ElementsSchema } from '../../domain/elements-schema';
import { TypesSchema } from '../../domain/types-schema';

export class CreateGraphRepo {
    public async create(
        graphId: string,
        administrators: Array<string>,
        elementsSchema: ElementsSchema,
        typesSchema: TypesSchema
    ): Promise<void> {
        const httpRequestBody: ICreateGraphRequestBody = {
            graphId: graphId,
            administrators: administrators,
            schema: {
                elements: elementsSchema.getElements(),
                types: typesSchema.getTypes(),
            },
        };

        const response: IApiResponse<undefined> = await new RestClient().post().graphs().requestBody(httpRequestBody).execute();

        if (response.status !== 201) {
            throw new Error(`Expected status code 201 for Created Graph but got (${response.status})`);
        }
    }
}
