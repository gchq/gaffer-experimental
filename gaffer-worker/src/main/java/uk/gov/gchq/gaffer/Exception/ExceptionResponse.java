package uk.gov.gchq.gaffer.Exception;

public class ExceptionResponse {
    private  String message;
    private  String details;

    public ExceptionResponse(final String message, final String details) {
        this.message = message;
        this.details = details;
    }

    public String getMessage() {
        return message;
    }

    public String getDetails() {
        return details;
    }
}
