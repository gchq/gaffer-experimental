import { IElements } from "../../domain/elements-schema";
import { ITypesSchema } from "../../domain/types-schema";
import { StoreType } from "../../domain/store-type";

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
    storeType: StoreType;
    url: string;
    root: string;
}
