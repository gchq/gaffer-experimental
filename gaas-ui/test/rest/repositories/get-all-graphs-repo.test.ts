import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GetAllGraphsRepo } from '../../../src/rest/repositories/get-all-graphs-repo';
import { Graph } from '../../../src/domain/graph';
import { IAllGraphsResponse } from '../../../src/rest/http-message-interfaces/response-interfaces';
import { RestApiError } from '../../../src/rest/RestApiError';

const mock = new MockAdapter(axios);
const repo = new GetAllGraphsRepo();

afterEach(() => mock.resetHandlers());

describe('Get All Graphs Repo', () => {
    it('should return many Graphs when api returns many', async () => {
        const apiResponse: IAllGraphsResponse = [
            {
                graphId: 'roadTraffic',
                description: 'DEPLOYED',
            },
            {
                graphId: 'basicGraph',
                description: 'DELETION_QUEUED',
            },
        ];
        mock.onGet('/graphs').reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph('roadTraffic', 'DEPLOYED'), new Graph('basicGraph', 'DELETION_QUEUED')];
        expect(actual).toEqual(expected);
    });

    it('should return one Graph when api returns one', async () => {
        const apiResponse: IAllGraphsResponse = [
            {
                graphId: 'streetTraffic',
                description: 'DELETION_QUEUED',
            },
        ];
        mock.onGet('/graphs').reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph('streetTraffic', 'DELETION_QUEUED')];
        expect(actual).toEqual(expected);
    });

    it('should throw RestApiError with correct status message when no response body', async () => {
        mock.onGet('/graphs').reply(404);

        await expect(repo.getAll()).rejects.toEqual(new RestApiError('Error Code 404', 'Not Found'));
    });

    it('should throw RestApiError with title and detail from response body', async () => {
        mock.onGet('/graphs').reply(404, { title: 'Forbidden', detail: 'Kubernetes access denied' });

        await expect(repo.getAll()).rejects.toEqual(new RestApiError('Forbidden', 'Kubernetes access denied'));
    });

    it('should throw unknown RestApiError when undefined status and body', async () => {
        mock.onGet('/graphs').reply(0);

        await expect(repo.getAll()).rejects.toEqual(new RestApiError('Unknown Error', 'Unable to make request'));
    });
});
