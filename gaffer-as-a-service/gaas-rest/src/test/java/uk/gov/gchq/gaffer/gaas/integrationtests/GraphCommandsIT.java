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

package uk.gov.gchq.gaffer.gaas.integrationtests;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.reactive.function.client.WebClient;
import uk.gov.gchq.gaffer.gaas.client.AddGraphsCommand;
import uk.gov.gchq.gaffer.gaas.client.PingGraphStatusCommand;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class GraphCommandsIT {
    @Autowired
    private WebClient.Builder webClientBuilder;
    private static List<ProxySubGraph> SUB_GRAPHS = Arrays.asList(new ProxySubGraph("valid", "ashsubgraphpm-kai-dev.apps.ocp1.purplesky.cloud", "/rest"));

    @Test
    public void validHostAndURIPathAndAddGraphRequest_returnsSuccessString() throws GaaSRestApiException {
        final WebClient webClient = webClientBuilder.baseUrl("http://localhost:8080/rest/v2").build();
        final String actual = new AddGraphsCommand(webClient, SUB_GRAPHS).execute();

        assertEquals("Successfully added all subgraph(s)", actual);
    }

    @Test
    public void validHostAndURIPath_returnsEvent() throws GaaSRestApiException {
        final WebClient webClient = webClientBuilder.baseUrl("http://localhost:8080/rest/v2").build();
        final String event = new PingGraphStatusCommand(webClient).execute();

        assertEquals("Graph status is UP", event);
    }
}
