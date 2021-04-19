/*
 * Copyright 2021 Crown Copyright
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

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import uk.gov.gchq.gaffer.gaas.model.GaaSApiErrorResponse;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class CustomizedResponseEntityExceptionHandlerTest {

  @Test
  public void handleAllExceptions_andConvertToGaaSApiErrorResponse() {
    final CustomizedResponseEntityExceptionHandler handler = new CustomizedResponseEntityExceptionHandler();

    final ResponseEntity<GaaSApiErrorResponse> result = handler.handleAllExceptions(new NullPointerException("something is null"), null);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
    assertEquals(new GaaSApiErrorResponse("NullPointerException", "something is null"), result.getBody());
  }
}
