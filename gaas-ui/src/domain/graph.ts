export class Graph {
    private graphId: string;
    private description: string;
    private url: string
    private status: string

    constructor(graphId: string, description: string, url: string, status: string) {
        this.graphId = graphId;
        this.description = description;
        this.url = url;
        this.status = status;
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
}
