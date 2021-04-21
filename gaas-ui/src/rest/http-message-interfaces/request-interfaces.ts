import { IElements } from "../../domain/elements-schema";
import { ITypesSchema } from "../../domain/types-schema";
import { StoreType } from "../../domain/store-type";

export interface ICreateGraphInterface {
    graphId: string;
    description: string;
}

export interface ICreateGraphRequestBody extends ICreateGraphInterface{
    schema: {
        elements: IElements;
        types: ITypesSchema;
    };
    storeType: StoreType.MAPSTORE | StoreType.ACCUMULO;
}

export interface ICreateFederatedGraphRequestBody extends ICreateGraphInterface {
    proxyStores: Array<{graphId: string, url: string}>;
    storeType: StoreType.FEDERATED_STORE;
}

export interface ICreateProxyGraphRequestBody extends ICreateGraphInterface{
    proxyContextRoot: string;
    proxyHost: string;
    storeType: StoreType.PROXY_STORE;
}