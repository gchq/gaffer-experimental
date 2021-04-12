export class Graph {
    private graphId: string;
    private description: string;
    private url: string

    constructor(graphId: string, description: string, url: string) {
        this.graphId = graphId;
        this.description = description;
        this.url = url;
    }

    public getId(): string {
        return this.graphId;
    }

    public getStatus(): string {
        return this.description;
    }
    public getUrl(): string {
        return this.url;
    }
}
