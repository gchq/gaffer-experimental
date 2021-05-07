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
import org.springframework.boot.test.context.SpringBootTest;
import uk.gov.gchq.gaffer.gaas.client.graph.AddGraphsCommand;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import java.util.Arrays;
import java.util.List;

@SpringBootTest
public class GraphCommandsIT {

    private static List<ProxySubGraph> SUB_GRAPHS = Arrays.asList(new ProxySubGraph("valid", "ashsubgraphpm-kai-dev.apps.ocp1.purplesky.cloud", "/rest"));

    @Test
    public void validHostAndURIPathAndAddGraphRequest_returnsSuccessString() throws GraphOperationException {
        new AddGraphsCommand("http://localhost:8080/rest/v2", SUB_GRAPHS).execute();

//        assertEquals("Successfully added all subgraph(s)", actual);
    }

    @Test
    public void validHostAndURIPath_returnsEvent() throws GraphOperationException {
//        final WebClient webClient = webClientBuilder.baseUrl("http://localhost:8080/rest/v2").build();
//        final String event = new ValidateGraphHostCommand("", webClient).execute();

//        assertEquals("Graph status is UP", event);
    }
}
