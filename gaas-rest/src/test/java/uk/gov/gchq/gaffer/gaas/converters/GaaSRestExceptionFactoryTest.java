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
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static uk.gov.gchq.gaffer.gaas.utilities.ApiExceptionTestFactory.makeApiException_custom;
import static uk.gov.gchq.gaffer.gaas.utilities.ApiExceptionTestFactory.makeApiException_duplicateGraph;
import static uk.gov.gchq.gaffer.gaas.utilities.ApiExceptionTestFactory.makeApiException_loggedOutOfCluster;
import static uk.gov.gchq.gaffer.gaas.utilities.ApiExceptionTestFactory.makeApiException_timeout;

@UnitTest
public class GaaSRestExceptionFactoryTest {

    @Test
    public void convertApiExceptionWhenResponseBodyIsNotJson() {
        final ApiException apiException = makeApiException_custom("ServerError", 500, "Not JSON");

        final GaaSRestApiException actual = GaaSRestExceptionFactory.from(apiException);

        assertEquals("Kubernetes Cluster Error: ServerError", actual.getMessage());
        assertEquals(500, actual.getStatusCode());
        assertTrue(actual.getCause() instanceof ApiException);
    }

    @Test
    public void convertApiExceptionWhenApiNotLoggedInToCluster() {
        final ApiException apiException = makeApiException_loggedOutOfCluster();

        final GaaSRestApiException actual = GaaSRestExceptionFactory.from(apiException);

        assertEquals("Kubernetes Cluster Error: Invalid authentication credentials for Kubernetes cluster", actual.getMessage());
        assertEquals(401, actual.getStatusCode());
        assertTrue(actual.getCause() instanceof ApiException);
    }

    @Test
    public void convertAlreadyExistsApiExceptionToGaasApiException() {
        final ApiException apiException = makeApiException_duplicateGraph();

        final GaaSRestApiException actual = GaaSRestExceptionFactory.from(apiException);

        assertEquals("Kubernetes Cluster Error: (AlreadyExists) gaffers.gchq.gov.uk \"testgraphid\" already exists", actual.getMessage());
        assertEquals(409, actual.getStatusCode());
        assertTrue(actual.getCause() instanceof ApiException);
    }

    @Test
    public void convertApiExceptionToGaasApiException() {
        final ApiException apiException = makeApiException_timeout();

        final GaaSRestApiException actual = GaaSRestExceptionFactory.from(apiException);

        assertEquals("Kubernetes Cluster Error: java.net.SocketTimeoutException: connect timed out", actual.getMessage());
        assertEquals(0, actual.getStatusCode());
        assertTrue(actual.getCause() instanceof ApiException);
    }
}
