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
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@UnitTest
public class ValidateGraphHostOperationTest {

    public static MockWebServer mockBackEnd;

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
        final String url = mockBackEnd.url("").toString();
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", url, "/notfound");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("The request to testGraph returned: 404 Not Found", actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientResponseException);
    }

    @Test
    public void shouldThrowException_WhenAttemptToConnectToInvalidHost() {
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", "http://localhost:404", "/rest");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        final String expected = "testGraph has invalid host. Reason: Connection refused at http://localhost:404/rest";
        assertEquals(expected, actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientRequestException);
    }

    @Test
    public void shouldThrow500Exception_WhenGraphReturns500() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(500));
        final String url = mockBackEnd.url("").toString();
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", url, "/internalerror");

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("The request to testGraph returned: 500 Internal Server Error", actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientResponseException);
    }

    @Test
    public void whenValidInputs_ShouldNotThrowException() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(200));
        final String url = mockBackEnd.url("").toString();
        final ProxySubGraph proxySubGraph = new ProxySubGraph("testGraph", url, "/valid");

        assertDoesNotThrow(() -> new ValidateGraphHostOperation(proxySubGraph).execute());
    }
}
