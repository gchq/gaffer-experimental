package uk.gov.gchq.gaffer.Exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import java.util.List;


@ControllerAdvice
public class CustomizedResponseEntityExceptionHandler  extends ResponseEntityExceptionHandler {

    @ExceptionHandler(GafferWorkerApiException.class)
    public final ResponseEntity<Object> handleAllException(final GafferWorkerApiException ex, final WebRequest request) throws Exception {
        ExceptionResponse exceptionResponse = new ExceptionResponse(ex.getMessage(), ex.getBody());

        return new ResponseEntity(exceptionResponse, HttpStatus.valueOf(ex.getStatusCode()));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            final MethodArgumentNotValidException ex, final HttpHeaders headers,
            final HttpStatus status, final WebRequest request) {
        BindingResult bindingResult = ex.getBindingResult();
        List<ObjectError> allErrors = bindingResult.getAllErrors();
        String objectError = allErrors.get(0).getDefaultMessage();
        ExceptionResponse exceptionResponse = new ExceptionResponse("Validation failed", objectError);
        return new ResponseEntity<>(exceptionResponse, HttpStatus.BAD_REQUEST);
    }

}
