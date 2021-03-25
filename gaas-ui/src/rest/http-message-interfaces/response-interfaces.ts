export interface IGraphByIdResponse {
    graphId: string;
    description: string;
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}
export interface IAllNameSpacesResponse extends Array<string> {}
