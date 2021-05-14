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

package uk.gov.gchq.gaffer.gaas.client.graph;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.GraphUrl;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
public class AddGraphsOperationTest {

    private static final List<ProxySubGraph> SUB_GRAPHS = Arrays.asList(new ProxySubGraph("valid", "validgraph-kubernetes.cluster.com", "/rest"));
    private static MockWebServer mockBackEnd;

    private final String validHost = mockBackEnd.getHostName() + ":" + mockBackEnd.getPort();

    @BeforeAll
    static void setUp() throws IOException {
        mockBackEnd = new MockWebServer();
        mockBackEnd.start();
    }

    @AfterAll
    static void tearDown() throws IOException {
        mockBackEnd.shutdown();
    }

    @Test
    public void whenValidInputs_ShouldNotThrowException() throws InterruptedException {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(200));
        final GraphUrl url = new GraphUrl(validHost, "/root");

        assertDoesNotThrow(() -> new AddGraphsOperation(url, SUB_GRAPHS).execute());
        final RecordedRequest request = mockBackEnd.takeRequest();
        assertEquals("/root/graph/operations/execute", request.getPath());
        final String expected = "{" +
                "\"class\":\"uk.gov.gchq.gaffer.operation.OperationChain\"," +
                "\"operations\":[{" +
                    "\"class\":\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\"," +
                    "\"graphId\":\"valid\"," +
                    "\"schema\":{" +
                        "\"types\":{}," +
                        "\"config\":null," +
                        "\"id\":null," +
                        "\"timestampProperty\":null," +
                        "\"vertexSerialiser\":null," +
                        "\"visibilityProperty\":null" +
                    "}," +
                    "\"storeProperties\":{" +
                        "\"gaffer.host\":\"validgraph-kubernetes.cluster.com\"," +
                        "\"gaffer.context-root\":\"/rest\"," +
                        "\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"," +
                        "\"gaffer.port\":\"80\"," +
                        "\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyProperties\"" +
                    "}" +
                "}]," +
                "\"options\":null" +
            "}";
        assertEquals(expected, new String(request.getBody().readByteArray()));
    }

    @Test
    public void whenGafferAPIReturns503Unavailable_ShouldRetryUntilSuccessful() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(503));
        mockBackEnd.enqueue(new MockResponse().setResponseCode(200));
        final GraphUrl url = new GraphUrl(validHost, "/rest");

        assertDoesNotThrow(() -> new AddGraphsOperation(url, SUB_GRAPHS).execute());
    }

    @Test
    public void whenGafferAPIReturns400_ShouldThrow400BadRequest() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(400));
        final GraphUrl url = new GraphUrl(validHost, "/rest");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsOperation(url, SUB_GRAPHS).execute());

        final String expected = "AddGraph OperationChain request to Federated Store Graph response: 400 Bad Request at " +
                "http://localhost:" + mockBackEnd.getPort() + "/rest/graph/operations/execute";
        assertEquals(expected, actual.getMessage());
    }

    @Test
    public void whenGafferAPIReturns404_ShouldThrow404NotFound() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(404));
        final GraphUrl url = new GraphUrl(validHost, "/notfound");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsOperation(url, SUB_GRAPHS).execute());

        final String expected = "AddGraph OperationChain request to Federated Store Graph response: 404 Not Found at " +
                "http://localhost:" + mockBackEnd.getPort() + "/notfound/graph/operations/execute";
        assertEquals(expected, actual.getMessage());
    }

    @Test
    public void invalidHost_ShouldThrowInvalidRequestException() {
        final GraphUrl url = new GraphUrl("invalid-host:8080", "/rest");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsOperation(url, SUB_GRAPHS).execute());

        final String expected = "AddGraph OperationChain request to Federated Store Graph failed. Reason: failed to " +
                "resolve 'invalid-host' after 3 queries , at http://invalid-host:8080/rest/graph/operations/execute";
        assertEquals(expected, actual.getMessage());
    }
}
