import { GraphType } from "./graph-type";

export class Graph {
    private readonly graphId: string;
    private readonly description: string;
    private readonly url: string;
    private readonly status: "UP" | "DOWN";
    private readonly storeType: string;
    private readonly type: GraphType;

    constructor(graphId: string, description: string, url: string, status: "UP" | "DOWN", storeType: string, type: GraphType) {
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

    public getStoreType(): string {
        return this.storeType;
    }

    public getType(): GraphType {
        return this.type;
    }
}
