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
package uk.gov.gchq.gaffer.gaas.utilities;

import io.kubernetes.client.openapi.ApiException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public final class ApiExceptionTestFactory {

    public static ApiException makeApiException_custom(final String title, final int code, final String detail) {
        final Map<String, List<String>> responseHeaders = new TreeMap<>();
        responseHeaders.put("content-type", Arrays.asList("application/json"));

        return new ApiException(title, code, responseHeaders, detail);
    }

    public static ApiException makeApiException_loggedOutOfCluster() {
        final Map<String, List<String>> responseHeaders = new TreeMap<>();
        responseHeaders.put("content-type", Arrays.asList("application/json"));

        return new ApiException(null, 401, responseHeaders, null);
    }

    public static ApiException makeApiException_duplicateGraph() {
        final Map<String, List<String>> responseHeaders = new TreeMap<>();
        responseHeaders.put("content-type", Arrays.asList("application/json"));
        final String detail = "{\"kind\":\"Status\",\"apiVersion\":\"v1\",\"metadata\":{},\"status\":\"Failure\",\"message\":\"gaffers.gchq.gov.uk \\\"testgraphid\\\" already exists\",\"reason\":\"AlreadyExists\",\"details\":{\"name\":\"testgraphid\",\"group\":\"gchq.gov.uk\",\"kind\":\"gaffers\"},\"code\":409}\n";

        return new ApiException("Conflict", 409, responseHeaders, detail);
    }

    public static ApiException makeApiException_timeout() {
        return new ApiException("java.net.SocketTimeoutException: connect timed out", 0, null, null);
    }

    private ApiExceptionTestFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
