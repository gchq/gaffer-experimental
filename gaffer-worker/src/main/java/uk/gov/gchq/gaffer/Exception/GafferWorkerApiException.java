package uk.gov.gchq.gaffer.Exception;

public class GafferWorkerApiException extends Exception {
    private String body;
    private int statusCode;
    public GafferWorkerApiException(final String message, final String body, final int statusCode) {
        super(message);
        this.body = body;
        this.statusCode = statusCode;
    }

    public String getBody() {
        return body;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
