/*
 * Copyright 2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package uk.gov.gchq.gaffer.gaas.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import uk.gov.gchq.gaffer.gaas.model.GaaSApiErrorResponse;
import java.util.List;

@ControllerAdvice
public class CustomizedResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(GaaSRestApiException.class)
    public final ResponseEntity<GaaSApiErrorResponse> handleAllGaaSRestApiExceptions(final GaaSRestApiException ex, final WebRequest request) {
        String title = "";
        if (ex.getCause() == null) {
            title = ex.getTitle();
        } else {
            title = ex.getCause().getMessage();
        }
        final GaaSApiErrorResponse gaaSApiErrorResponse = new GaaSApiErrorResponse(title, ex.getMessage());

        return new ResponseEntity(gaaSApiErrorResponse, HttpStatus.valueOf(ex.getStatusCode()));
    }

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<GaaSApiErrorResponse> handleAllExceptions(final Exception ex, final WebRequest request) {

        final GaaSApiErrorResponse gaaSApiErrorResponse = new GaaSApiErrorResponse(ex.getClass().getSimpleName(), ex.getMessage());

        return new ResponseEntity(gaaSApiErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(final HttpMessageNotReadableException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        final GaaSApiErrorResponse gaaSApiErrorResponse = new GaaSApiErrorResponse(ex.getCause().getClass().getSimpleName(), ex.getCause().getMessage());
        return new ResponseEntity<>(gaaSApiErrorResponse, status);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            final MethodArgumentNotValidException ex, final HttpHeaders headers,
            final HttpStatus status, final WebRequest request) {
        BindingResult bindingResult = ex.getBindingResult();
        List<ObjectError> allErrors = bindingResult.getAllErrors();
        String objectError = allErrors.get(0).getDefaultMessage();
        GaaSApiErrorResponse gaaSApiErrorResponse = new GaaSApiErrorResponse("Validation failed", objectError);
        return new ResponseEntity<>(gaaSApiErrorResponse, HttpStatus.BAD_REQUEST);
    }
}
