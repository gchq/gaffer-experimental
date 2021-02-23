import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GetAllGraphsRepo } from '../../../src/rest/repositories/get-all-graphs-repo';
import { Graph } from '../../../src/domain/graph';
import { IAllGraphsResponse } from '../../../src/rest/http-message-interfaces/response-interfaces';

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

    it('should bubble up exception from rest call', async () => {
        mock.onGet('/graphs').reply(404);

        await expect(repo.getAll()).rejects.toThrow(new Error('Request failed with status code 404'));
    });
});
