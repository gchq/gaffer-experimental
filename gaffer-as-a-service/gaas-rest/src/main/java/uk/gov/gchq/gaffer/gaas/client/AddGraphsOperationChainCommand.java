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

package uk.gov.gchq.gaffer.gaas.client;

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.model.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.operation.OperationChain;
import uk.gov.gchq.gaffer.proxystore.ProxyProperties;
import uk.gov.gchq.gaffer.proxystore.ProxyStore;
import uk.gov.gchq.gaffer.store.schema.Schema;
import java.util.List;
import java.util.stream.Collectors;

public class AddGraphsOperationChainCommand implements Command {

    public static final String EXECUTE_OPERATION_URI = "/graph/operations/execute";
    private final WebClient webClient;
    private final List<ProxySubGraph> graphs;

    public AddGraphsOperationChainCommand(final WebClient webClient, final List<ProxySubGraph> graphs) {
        this.webClient = webClient;
        this.graphs = graphs;
    }

    @Override
    public String execute() throws GaaSRestApiException {
        try {
            // Gaffer returns an empty body for successful AddGraph operations
            this.webClient
                    .post()
                    .uri(EXECUTE_OPERATION_URI)
                    .body(Mono.just(getRequestBody()), OperationChain.class)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            return "Successfully added all subgraph(s)";

        } catch (WebClientRequestException e) {
            throw new GaaSRestApiException(e.getMessage(), 0, e.getCause());

        } catch (WebClientResponseException e) {
            throw new GaaSRestApiException(e.getMessage(), e.getResponseBodyAsString(), e.getRawStatusCode());
        }
    }

    private OperationChain getRequestBody() {
        return new OperationChain(getAddGraphOperations());
    }

    private List<AddGraph> getAddGraphOperations() {

        return graphs.stream().map(subGraph -> {

            final ProxyProperties storeProperties = new ProxyProperties();
            storeProperties.setStoreClass(ProxyStore.class);
            storeProperties.setGafferHost(subGraph.getHost());
            // TODO: Port number needs to match where the subgraph is hosted, needs to mitigate risk of breaking
            storeProperties.setGafferPort(80);
            storeProperties.setGafferContextRoot(subGraph.getRoot());

            return new AddGraph.Builder()
                    .graphId(subGraph.getGraphId())
                    .storeProperties(storeProperties)
                    .schema(new Schema())
                    .build();
        }).collect(Collectors.toList());
    }
}
