export interface IGraphByIdResponse {
    graphId: string;
    description: string;
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}
