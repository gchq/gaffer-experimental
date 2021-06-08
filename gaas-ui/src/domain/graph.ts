import { GraphType } from "./graph-type";
import { StoreType } from "./store-type";

export class Graph {
    private graphId: string;
    private description: string;
    private url: string;
    private status: "UP" | "DOWN";
    private storeType: StoreType;
    private type: GraphType;

    constructor(graphId: string, description: string, url: string, status: "UP" | "DOWN", storeType: StoreType, type: GraphType) {
        this.graphId = graphId;
        this.description = description;
        this.url = url;
        this.status = status;
        this.storeType = storeType;
        this.type = type;
    }

    public getId(): string {
        return this.graphId;
    }

    public getDescription(): string {
        return this.description;
    }

    public getUrl(): string {
        return this.url;
    }

    public getStatus(): string {
        return this.status;
    }

    public getStoreType(): StoreType {
        return this.storeType;
    }

    public getType(): GraphType {
        return this.type;
    }
}
