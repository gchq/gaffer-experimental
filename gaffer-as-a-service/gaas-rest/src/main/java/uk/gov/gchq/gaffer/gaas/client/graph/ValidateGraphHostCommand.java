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
import uk.gov.gchq.gaffer.rest.SystemStatus;

public class ValidateGraphHostCommand implements Command {

    public static final String GRAPH_STATUS_URI = "/graph/status";
    private String graphId;
    private final WebClient webClient;

    public ValidateGraphHostCommand(final String graphId, final String graphUrl) {
        this.graphId = graphId;
        this.webClient = WebClient.create(graphUrl);
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
                throw new GraphOperationException(graphId + " is down");
            }

        } catch (final WebClientRequestException e) {
            throw new GraphOperationException(graphId + " host is invalid. Reason: " + e.getMostSpecificCause().getMessage(), e);

        } catch (final WebClientResponseException e) {
            throw new GraphOperationException(graphId + " request returned status " + e.getRawStatusCode(), e);
        }
    }
}
