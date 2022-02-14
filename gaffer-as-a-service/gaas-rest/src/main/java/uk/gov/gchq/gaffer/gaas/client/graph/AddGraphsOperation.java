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

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.GraphUrl;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.operation.OperationChain;
import uk.gov.gchq.gaffer.proxystore.ProxyProperties;
import uk.gov.gchq.gaffer.proxystore.ProxyStore;
import uk.gov.gchq.gaffer.store.schema.Schema;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

public class AddGraphsOperation implements Command {

    public static final String EXECUTE_OPERATION_URI = "/graph/operations/execute";
    public static final int GAFFER_PORT = 80;

    private final List<ProxySubGraph> graphs;
    private final WebClient webClient;

    public AddGraphsOperation(final GraphUrl url, final List<ProxySubGraph> graphs) {
        this.graphs = graphs;
        this.webClient = WebClient.create(url.buildUrl());
    }

    @Override
    public void execute() throws GraphOperationException {
        try {
            this.webClient
                    .post()
                    .uri(EXECUTE_OPERATION_URI)
                    .body(Mono.just(makeOperationChainRequestBody()), OperationChain.class)
                    .retrieve()
                    .toBodilessEntity()
                    .retryWhen(Retry.fixedDelay(40, Duration.ofSeconds(3))
                            .filter(e -> is503ServiceUnavailable(e)))
                    .block();

        } catch (final WebClientRequestException e) {
            throw new GraphOperationException("AddGraph OperationChain request to Federated Store Graph failed. Reason: " +
                    e.getMostSpecificCause().getMessage() + ", at " + e.getUri(), e);

        } catch (final WebClientResponseException e) {
            throw new GraphOperationException("AddGraph OperationChain request to Federated Store Graph response: " +
                    e.getRawStatusCode() + " " + e.getStatusText() + " at " + e.getRequest().getURI(), e);
        }
    }

    private OperationChain makeOperationChainRequestBody() {

        final List<AddGraph> addGraphOperations = graphs.stream().map(subGraph -> {

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

        return new OperationChain(addGraphOperations);
    }

    private boolean is503ServiceUnavailable(final Throwable e) {
        if (e instanceof WebClientResponseException) {
            return ((WebClientResponseException) e).getStatusCode() == SERVICE_UNAVAILABLE;
        }
        return false;
    }
}
