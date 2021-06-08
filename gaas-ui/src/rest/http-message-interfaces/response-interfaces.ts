export interface IGraphByIdResponse {
    graphId: string;
    description: string;
    url: string;
    status: "UP" | "DOWN";
    storeType: "federatedStore" | "mapStore" | "accumuloStore" | "proxyStore";
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}

export interface IAllNameSpacesResponse extends Array<string> {}

export interface IGraphStatusResponse {
    status: string;
}

export interface IGetAllGraphIdsResponse extends Array<string> {}

export interface IGetStoreTypesResponse {
    storeTypes: string[];
}
