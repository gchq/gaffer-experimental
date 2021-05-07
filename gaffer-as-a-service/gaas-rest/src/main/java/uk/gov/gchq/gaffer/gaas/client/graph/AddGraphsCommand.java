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

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.operation.OperationChain;
import uk.gov.gchq.gaffer.proxystore.ProxyProperties;
import uk.gov.gchq.gaffer.proxystore.ProxyStore;
import uk.gov.gchq.gaffer.store.schema.Schema;
import java.util.List;
import java.util.stream.Collectors;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

public class AddGraphsCommand implements Command {

    public static final String EXECUTE_OPERATION_URI = "/graph/operations/execute";
    public static final int GAFFER_PORT = 80;
    private final WebClient webClient;
    private final List<ProxySubGraph> graphs;
    private final FederatedRequestBody graph;

    public AddGraphsCommand(final FederatedRequestBody graph, final List<ProxySubGraph> graphs) {
        final String url = makeURL(graph);
        this.webClient = WebClient.create(url);
        this.graph=graph;
        this.graphs = graphs;
    }

    public String makeURL(final FederatedRequestBody graph) {
        final String url = "http://" + graph.getGraphId().toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX;
        return url;
    }

    @Override
    public void execute() throws GraphOperationException {
        try {
            // Gaffer returns an empty body for successful AddGraph operations
            this.webClient
                    .post()
                    .uri(EXECUTE_OPERATION_URI)
                    .body(Mono.just(makeRequestBody()), OperationChain.class)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

        } catch (final WebClientRequestException e) {
            throw new GraphOperationException(graph.getGraphId() + " has invalid host. Reason: " + e.getMostSpecificCause().getMessage() + " at " + makeURL(graph), e);

        } catch (final WebClientResponseException e) {
            throw new GraphOperationException("The request to " + graph.getGraphId() + " returned: " + e.getRawStatusCode() + " " +  e.getStatusText(), e);
        }
    }

    private OperationChain makeRequestBody() {
        return new OperationChain(new OperationChain(getAddGraphOperations()));
    }

    private List<AddGraph> getAddGraphOperations() {

        return graphs.stream().map(subGraph -> {

            final ProxyProperties storeProperties = new ProxyProperties();
            storeProperties.setStoreClass(ProxyStore.class);
            storeProperties.setGafferHost(subGraph.getHost());
            // TODO: Port number needs to match where the subgraph is hosted, needs to mitigate risk of breaking
            storeProperties.setGafferPort(GAFFER_PORT);
            storeProperties.setGafferContextRoot(subGraph.getRoot());

            return new AddGraph.Builder()
                    .graphId(subGraph.getGraphId())
                    .storeProperties(storeProperties)
                    .schema(new Schema())
                    .build();
        }).collect(Collectors.toList());
    }
}
