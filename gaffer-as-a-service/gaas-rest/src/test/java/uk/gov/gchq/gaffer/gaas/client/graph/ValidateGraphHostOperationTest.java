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

import com.google.gson.Gson;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import uk.gov.gchq.gaffer.rest.SystemStatus;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@UnitTest
public class ValidateGraphHostOperationTest {

    public static MockWebServer mockBackEnd;
    private String url = mockBackEnd.getHostName() + ":" + mockBackEnd.getPort();

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
    public void shouldThrow404Exception_WhenGraphReturns404() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(404));
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", url, "/notfound");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("Get Status request for 'testGraph' returned: 404 Not Found at http://localhost:" + mockBackEnd.getPort() + "/notfound/graph/status", actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientResponseException);
    }

    @Test
    public void shouldThrow500Exception_WhenGraphReturns500() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(500));
        final ProxySubGraph proxySubGraph = new ProxySubGraph("brokengraph", url, "/internalerror");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("Get Status request for 'brokengraph' returned: 500 Internal Server Error at http://localhost:" + mockBackEnd.getPort() + "/internalerror/graph/status", actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientResponseException);
    }

    @Test
    public void shouldThrowConnectionRefusedException_WhenAttemptToConnectToInvalidHost() {
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", "localhost:404", "/rest");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        final String expected = "Connection refused at http://localhost:404/rest/graph/status";
        assertTrue(actual.getMessage().contains(expected));
        assertTrue(actual.getCause() instanceof WebClientRequestException);
    }

    @Test
    public void shouldThrowGraphNotUpException_WhenGraphReturnsOutOfServiceStatus() {
        mockBackEnd.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-type", "application/json")
                .setBody(new Gson().toJson(SystemStatus.OUT_OF_SERVICE)));
        final ProxySubGraph proxySubGraph = new ProxySubGraph("noservicegraph", url, "/rest");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("'noservicegraph' status is OUT_OF_SERVICE. The system is out of service.", actual.getMessage());
    }

    @Test
    public void whenUnexpectedResponseBody_() {
        mockBackEnd.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-type", "application/json")
                .setBody("{\"unexpected\":\"response body\"}"));
        final ProxySubGraph proxySubGraph = new ProxySubGraph("unknown-status-graph", url, "/valid");

        final GraphOperationException exception = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("'unknown-status-graph' returned a null status", exception.getMessage());
    }

    @Test
    public void shouldThrowGraphNotUpException_WhenGraphReturnsDownStatus() throws InterruptedException {
        mockBackEnd.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-type", "application/json")
                .setBody(new Gson().toJson(SystemStatus.DOWN)));
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", url, "/rest-down");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("'testGraph' status is DOWN. The system is unavailable.", actual.getMessage());
        final RecordedRequest request = mockBackEnd.takeRequest();
        assertEquals("/rest-down/graph/status", request.getPath());
    }

    @Test
    public void whenResponseIsSuccessfulAndGraphIsUp_ShouldNotThrowException() throws InterruptedException {
        mockBackEnd.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-type", "application/json")
                .setBody(new Gson().toJson(SystemStatus.UP)));
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", url, "/rest-up");

        assertDoesNotThrow(() -> new ValidateGraphHostOperation(proxySubGraph).execute());
        final RecordedRequest request = mockBackEnd.takeRequest();
        assertEquals("/rest-up/graph/status", request.getPath());
    }
}
