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
import uk.gov.gchq.gaffer.gaas.client.graph.AddGraphsOperation;
import uk.gov.gchq.gaffer.gaas.client.graph.ValidateGraphHostOperation;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.GraphUrl;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import java.util.Collections;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class GraphCommandsIT {

    private final GraphUrl validFederatedStoreURL = new GraphUrl("localhost:8080", "/rest/v2");
    private final List<ProxySubGraph> subGraphs = Collections.singletonList(new ProxySubGraph("validgraph", "graph-kubernetes.cluster.cloud", "/rest"));

    @Test
    public void addGraphs_shouldNotThrowAnything_whenSuccessfullyAddsGraph() {
        assertDoesNotThrow(() -> new AddGraphsOperation(validFederatedStoreURL, subGraphs).execute());
    }

    @Test
    public void addGraphs_shouldThrowGraphOpException_whenUrlIsInvalid() {
        assertThrows(GraphOperationException.class, () -> new AddGraphsOperation(validFederatedStoreURL, subGraphs).execute());
    }

    @Test
    public void validateGraphHost_shouldThrowGraphOpEx_whenIncorrectRoot() {
        final ProxySubGraph proxySubGraph = new ProxySubGraph("notfoundroot", "localhost:8080", "/not-found-root");

        final GraphOperationException exception = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("Get Status request for 'notfoundroot' failed. Reason: Connection refused at http://localhost:8080/not-found-root/graph/status", exception.getMessage());
    }

    @Test
    public void validateGraphHost_shouldThrowGraphOpEx_whenHostIsntHostingAGraph() {
        final ProxySubGraph proxySubGraph = new ProxySubGraph("invalidhost", "localhost:8082", "/rest");

        final GraphOperationException exception = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("Get Status request for 'invalidhost' failed. Reason: Connection refused at http://localhost:8082/rest/graph/status", exception.getMessage());
    }
}
