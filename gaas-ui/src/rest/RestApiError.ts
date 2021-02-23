export class RestApiError {

    private details;
    private message;
    constructor(details: string, message: string) {
        this.details = details;
        this.message = message;
    }

    public toString(): string {
        return this.details + ': ' + this.message;
    }
}