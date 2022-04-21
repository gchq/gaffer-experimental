export interface ICreateGraphInterface {
    graphId: string;
    description: string;
}
export interface ICreateGraphRequestBody extends ICreateGraphInterface {
    schema: {
        entities: object;
        edges: object;
        types: object;
    };
    configName: string;
}
export interface ICreateFederatedGraphRequestBody extends ICreateGraphInterface {
    proxySubGraphs: Array<{ graphId: string; host: string; root: string }>;
    configName: string;
}
export interface ICreateProxyGraphRequestBody extends ICreateGraphInterface {
    proxyContextRoot: string;
    proxyHost: string;
    storeType: string;
}
