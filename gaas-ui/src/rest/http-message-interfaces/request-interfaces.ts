import { IElements } from "../../domain/elements-schema";
import { ITypesSchema } from "../../domain/types-schema";
import { StoreType } from "../../domain/store-type";
import {Graph} from "../../domain/graph";

export interface ICreateGraphRequestBody {
    graphId: string;
    administrators: Array<string>;
    schema: {
        elements: IElements;
        types: ITypesSchema;
    };
}
export interface ICreateSimpleGraphRequestBody {
    graphId: string;
    description: string;
    schema: {
        elements: IElements;
        types: ITypesSchema;
    };
    storeType: StoreType;
    proxyStores: Graph[];
    root: string;
}

export interface ICreateFederatedRequestBody {
    graphId: string;
    description: string;
    storeType: StoreType;
    proxyStores: Graph[];
    root: string;
}

