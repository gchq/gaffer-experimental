export class APIError {
    private detail;
    private title;
    constructor(title: string, detail: string) {
        this.detail = detail;
        this.title = title;
    }

    public toString(): string {
        return this.title + ": " + this.detail;
    }
}
