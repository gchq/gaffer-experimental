import { ITypesSchema } from "../../domain/types-schema";

export interface ICreateGraphInterface {
    graphId: string;
    description: string;
}
export interface ICreateGraphRequestBody extends ICreateGraphInterface {
    schema: {
        entities: object;
        edges: object;
        types: ITypesSchema;
    };
    configName: string;
}
export interface ICreateFederatedGraphRequestBody extends ICreateGraphInterface {
    proxyStores: Array<{ graphId: string; url: string }>;
    configName: string;
}
export interface ICreateProxyGraphRequestBody extends ICreateGraphInterface {
    proxyContextRoot: string;
    proxyHost: string;
    storeType: string;
}
