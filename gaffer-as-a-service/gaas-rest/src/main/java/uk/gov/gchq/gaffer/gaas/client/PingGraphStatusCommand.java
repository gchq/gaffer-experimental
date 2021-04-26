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
import uk.gov.gchq.gaffer.gaas.model.GaaSRestApiException;
import uk.gov.gchq.gaffer.rest.SystemStatus;

public class PingGraphStatusCommand implements Command {

    public static final String GRAPH_STATUS_URI = "/v2/graph/status";
    private final WebClient webClient;

    public PingGraphStatusCommand(final WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public String execute() throws GaaSRestApiException {
        try {
            final SystemStatus response = this.webClient
                    .get()
                    .uri(GRAPH_STATUS_URI)
                    .retrieve()
                    .bodyToMono(SystemStatus.class)
                    .block();
            return "Graph status is " + response.getStatus().getCode();

        } catch (WebClientRequestException e) {
            throw new GaaSRestApiException(e.getLocalizedMessage(), 0, e);

        } catch (WebClientResponseException e) {
            throw new GaaSRestApiException(e.getLocalizedMessage(), e.getRawStatusCode(), e);
        }
    }
}
