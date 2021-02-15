package uk.gov.gchq.gaffer.Exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;


@ControllerAdvice
public class CustomizedResponseEntityExceptionHandler  extends ResponseEntityExceptionHandler {

    @ExceptionHandler(GafferWorkerApiException.class)
    public final ResponseEntity<Object> handleAllException(final GafferWorkerApiException ex, final WebRequest request) throws Exception {
        ExceptionResponse exceptionResponse = new ExceptionResponse(ex.getMessage(), ex.getBody());

        return new ResponseEntity(exceptionResponse, HttpStatus.valueOf(ex.getStatusCode()));
    }
//
//    @Override
//    protected ResponseEntity<Object> handleMethodArgumentNotValid(final MethodArgumentNotValidException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
//
//        ExceptionResponse exceptionResponse = new ExceptionResponse("Validation error", ex.getBindingResult().toString());
//
//        return  new ResponseEntity<>(exceptionResponse, headers, HttpStatus.BAD_REQUEST);
//    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            final MethodArgumentNotValidException ex, final HttpHeaders headers,
            final HttpStatus status, final WebRequest request) {

        ExceptionResponse exceptionResponse = new ExceptionResponse("Validation error  3", ex.getBindingResult().toString());

        return new ResponseEntity<>(exceptionResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
