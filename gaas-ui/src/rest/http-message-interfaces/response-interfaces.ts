export interface IGraphByIdResponse {
    graphId: string;
    description: string;
    url: string;
    status: "UP" | "DOWN";
    storeType: "FEDERATED_STORE" | "MAPSTORE" | "ACCUMULO";
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}

export interface IAllNameSpacesResponse extends Array<string> {}
export interface IGraphStatusResponse {
    status: string;
}