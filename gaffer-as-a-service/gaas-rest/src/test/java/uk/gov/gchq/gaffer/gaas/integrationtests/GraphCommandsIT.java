/*
 * Copyright 2022 Crown Copyright
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
import uk.gov.gchq.gaffer.gaas.AbstractTest;
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
class GraphCommandsIT extends AbstractTest {

    private final GraphUrl invalidFederatedStoreURL = new GraphUrl("myinvalidhost.cluster", "/rest");
    private final List<ProxySubGraph> subGraphs = Collections.singletonList(new ProxySubGraph("test5", "somehost.cluster", "/rest"));

    @Test
    void addGraphs_shouldNotThrowAnything_whenSuccessfullyAddsGraph() {
        final GraphUrl validFederatedStoreURL = new GraphUrl(fedStoreUrl, "/rest");
        final List<ProxySubGraph> subGraphsForValidFedStore = Collections.singletonList(new ProxySubGraph(proxyGraphId, proxyGraphHost, "/rest"));
        assertDoesNotThrow(() -> new AddGraphsOperation(validFederatedStoreURL, subGraphsForValidFedStore).execute());
    }

    @Test
    void addGraphs_shouldThrowGraphOpException_whenUrlIsInvalid() {
        assertThrows(GraphOperationException.class, () -> new AddGraphsOperation(invalidFederatedStoreURL, subGraphs).execute());
    }

    @Test
    void validateGraphHost_shouldThrowGraphOpEx_whenIncorrectRoot() {
        final ProxySubGraph proxySubGraph = new ProxySubGraph("notfoundroot", "localhost:8080", "/not-found-root");

        final GraphOperationException exception = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("Get Status request for 'notfoundroot' failed. Reason: Connection refused at http://localhost:8080/not-found-root/graph/status", exception.getMessage());
    }

    @Test
    void validateGraphHost_shouldThrowGraphOpEx_whenHostIsntHostingAGraph() {
        final ProxySubGraph proxySubGraph = new ProxySubGraph("invalidhost", "localhost:8082", "/rest");

        final GraphOperationException exception = assertThrows(GraphOperationException.class, () -> new ValidateGraphHostOperation(proxySubGraph).execute());

        assertEquals("Get Status request for 'invalidhost' failed. Reason: Connection refused at http://localhost:8082/rest/graph/status", exception.getMessage());
    }
}
