package uk.gov.gchq.gaffer.gaas.client;/*
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

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import uk.gov.gchq.gaffer.gaas.model.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@UnitTest
public class AddGraphsCommandTest {

    @Autowired
    private WebClient.Builder webClientBuilder;

    private static List<ProxySubGraph> SUB_GRAPHS = Arrays.asList(new ProxySubGraph("valid", "host only -DO NOT INCLUDE protocol", "/rest"));

    @Disabled
    @Test
    public void invalidRequestBody_() {
        final WebClient webClient = webClientBuilder.baseUrl("http://localhost:8080/notfound").build();

        final GaaSRestApiException actual = assertThrows(GaaSRestApiException.class, () -> new AddGraphsCommand(webClient, SUB_GRAPHS).execute());

        assertEquals(404, actual.getStatusCode());
        assertEquals("404 Not Found from GET http://localhost:8080/notfound/v2/graph/status", actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientResponseException);
    }

    @Disabled
    @Test
    public void invalidURIPath_() {
        final WebClient webClient = webClientBuilder.baseUrl("http://localhost:8080/notfound").build();

        final GaaSRestApiException actual = assertThrows(GaaSRestApiException.class, () -> new AddGraphsCommand(webClient, SUB_GRAPHS).execute());

        assertEquals(404, actual.getStatusCode());
        assertEquals("404 Not Found from GET http://localhost:8080/notfound/v2/graph/status", actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientResponseException);
    }

    @Disabled
    @Test
    public void invalidHost_() {
        final WebClient webClient = webClientBuilder.baseUrl("http://localhost:404/rest").build();

        final GaaSRestApiException actual = assertThrows(GaaSRestApiException.class, () -> new AddGraphsCommand(webClient, SUB_GRAPHS).execute());

        final String expected = "Connection refused: localhost/127.0.0.1:404; " +
                "nested exception is io.netty.channel.AbstractChannel$AnnotatedConnectException: Connection refused: localhost/127.0.0.1:404";
        assertEquals(expected, actual.getMessage());
        assertTrue(actual.getCause() instanceof WebClientRequestException);
    }

    @Test
    public void validHostAndURIPathAndAddGraphRequest_returnsSuccessString() throws GaaSRestApiException {
        final WebClient webClient = webClientBuilder.baseUrl("http://aatikafederatedpm-kai-dev.apps.ocp1.purplesky.cloud/rest").build();

        final String actual = new AddGraphsCommand(webClient, SUB_GRAPHS).execute();

        assertEquals("Successfully added all subgraph(s)", actual);
    }
}