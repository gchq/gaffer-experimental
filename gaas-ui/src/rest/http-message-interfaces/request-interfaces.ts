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
    storeType: string
}

export interface ICreateFederatedGraphRequestBody extends ICreateGraphInterface {
    proxyStores: Array<{graphId: string, url: string}>;
    storeType: string;
}

export interface ICreateProxyGraphRequestBody extends ICreateGraphInterface{
    proxyContextRoot: string;
    proxyHost: string;
    storeType: string;
}