export interface IGraphByIdResponse {
    graphId: string;
    description: string;
    url: string
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}
export interface IAllNameSpacesResponse extends Array<string> {}
