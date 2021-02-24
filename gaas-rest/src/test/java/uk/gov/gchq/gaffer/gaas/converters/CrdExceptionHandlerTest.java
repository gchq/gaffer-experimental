/*
 * Copyright 2020 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.converters;

import io.kubernetes.client.openapi.ApiException;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CrdExceptionHandlerTest {

    @Test
    public void convertApiExceptionToGaasApiException() {
        final Map<String, List<String>> responseHeaders = new TreeMap<>();
        responseHeaders.put("content-type", Arrays.asList("application/json"));
        final String responseBody = "{\"kind\":\"Status\",\"apiVersion\":\"v1\",\"metadata\":{},\"status\":\"Failure\",\"message\":\"gaffers.gchq.gov.uk \\\"testgraphid\\\" already exists\",\"reason\":\"AlreadyExists\",\"details\":{\"name\":\"testgraphid\",\"group\":\"gchq.gov.uk\",\"kind\":\"gaffers\"},\"code\":409}\n";

        final GaaSRestApiException actual = assertThrows(GaaSRestApiException.class, () -> {
            CrdExceptionHandler.handle(new ApiException("Conflict", 409, responseHeaders, responseBody));
        });

        assertEquals("AlreadyExists", actual.getBody());
        assertEquals("gaffers.gchq.gov.uk \"testgraphid\" already exists", actual.getMessage());
        assertEquals(409, actual.getStatusCode());
        assertTrue(actual.getCause() instanceof ApiException);
    }
}
