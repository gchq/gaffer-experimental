import { GraphType } from "./graph-type";

export class Graph {
    private graphId: string;
    private description: string;
    private url: string;
    private status: string;
    private type: GraphType;

    constructor(graphId: string, description: string, url: string, status: string, type: GraphType) {
        this.graphId = graphId;
        this.description = description;
        this.url = url;
        this.status = status;
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
    public getType(): GraphType {
        return this.type;
    }
}
