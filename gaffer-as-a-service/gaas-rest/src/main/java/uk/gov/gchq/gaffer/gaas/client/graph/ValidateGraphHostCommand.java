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
import uk.gov.gchq.gaffer.gaas.client.graph.Command;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.rest.SystemStatus;

public class ValidateGraphHostCommand implements Command {

    public static final String GRAPH_STATUS_URI = "/graph/status";
    private final ProxySubGraph proxySubGraph;
    private final WebClient webClient;

    public ValidateGraphHostCommand(final ProxySubGraph proxySubGraph) {
        this.proxySubGraph = proxySubGraph;
        this.webClient = WebClient.create(proxySubGraph.getHost());
    }

    @Override
    public void execute() throws GraphOperationException {
        try {
            final SystemStatus response = this.webClient
                    .get()
                    .uri(GRAPH_STATUS_URI)
                    .retrieve()
                    .bodyToMono(SystemStatus.class)
                    .block();

            if (response == SystemStatus.DOWN) {
                throw new GraphOperationException(proxySubGraph.getGraphId() + " is down");
            }

        } catch (final WebClientRequestException e) {
            throw new GraphOperationException(proxySubGraph.getGraphId() + " has invalid host. Reason: " + e.getMostSpecificCause().getMessage() + " at " + proxySubGraph.getHost() + proxySubGraph.getRoot(), e);

        } catch (final WebClientResponseException e) {
            throw new GraphOperationException("The request to " + proxySubGraph.getGraphId() + " returned: " + e.getRawStatusCode() + " " +  e.getStatusText(), e);
        }
    }
}
