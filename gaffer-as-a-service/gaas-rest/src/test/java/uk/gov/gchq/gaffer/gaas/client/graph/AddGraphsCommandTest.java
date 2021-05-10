/*
 *
 *  * Copyright 2021 Crown Copyright
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package uk.gov.gchq.gaffer.gaas.client.graph;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
public class AddGraphsCommandTest {

    private static List<ProxySubGraph> SUB_GRAPHS = Arrays.asList(new ProxySubGraph("valid", "host only -DO NOT INCLUDE protocol", "/rest"));
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
    public void whenGafferAPIReturns400_ShouldThrow400BadRequest() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(400));
        final String url = mockBackEnd.url("").toString();

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsCommand(url, SUB_GRAPHS).execute());

        assertEquals("The request to http://localhost:" + mockBackEnd.getPort() + "/ returned: 400 Bad Request", actual.getMessage());
    }


    @Test
    public void whenGafferAPIReturns404_ShouldThrow404NotFound() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(404));
        final String url = mockBackEnd.url("").toString();

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsCommand(url, SUB_GRAPHS).execute());

        assertEquals("The request to http://localhost  :" + mockBackEnd.getPort() + "/ returned: 404 Not Found", actual.getMessage());
    }

    @Test
    public void invalidHost_ShouldThrowInvalidRequestException() {
        final String url = "something";

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsCommand(url, SUB_GRAPHS).execute());

        final String expected = "Invalid host. Reason: failed to resolve 'something' after 4 queries at something";
        assertEquals(expected, actual.getMessage());
    }

    @Test
    public void whenValidInputs_ShouldNotThrowException() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(200));
        final String url = mockBackEnd.url("").toString();

        assertDoesNotThrow(() -> new AddGraphsCommand(url, SUB_GRAPHS).execute());
    }
}