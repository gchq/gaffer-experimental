/*
 * Copyright 2021 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.client.graph.AddGraphsCommand;
import uk.gov.gchq.gaffer.gaas.client.graph.GraphCommandExecutor;
import uk.gov.gchq.gaffer.gaas.client.graph.ValidateGraphHostCommand;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import java.util.ArrayList;
import java.util.List;
import static uk.gov.gchq.gaffer.gaas.factories.GafferHelmValuesFactory.from;

@Service
public class CreateFederatedStoreGraphService {

    @Autowired
    private CRDClient crdClient;

    @Autowired
    private GraphCommandExecutor graphCommandExecutor;

    public void createFederatedStore(final FederatedRequestBody request) throws GaaSRestApiException {
        if (request.getProxySubGraphs().isEmpty()) {
            throw new GaaSRestApiException("Bad Request", "There are no sub-graphs to add", 400);
        }
        validateProxyGraphURLs(request.getProxySubGraphs());
        crdClient.createCRD(from(request));
        addSubgraphsToFederatedStore(request);
    }

    private void validateProxyGraphURLs(final List<ProxySubGraph> proxySubGraphs) throws GaaSRestApiException {
        final List<String> errorNotifications = new ArrayList<>();
        proxySubGraphs.stream()
                .forEach((proxySubGraph) -> {
                    try {
                        graphCommandExecutor.execute(new ValidateGraphHostCommand(proxySubGraph));
                    } catch (final GraphOperationException e) {
                        errorNotifications.add(proxySubGraph.getGraphId() + ": " + e.getMessage());
                    }
                });
        if (errorNotifications.size() > 0) {
            throw new GaaSRestApiException("Bad Request", "Invalid Proxy Graph URL(s): " + errorNotifications.toString(), 400);
        }
    }

    private void addSubgraphsToFederatedStore(final FederatedRequestBody request) throws GaaSRestApiException {
        try {
            graphCommandExecutor.execute(new AddGraphsCommand(request, request.getProxySubGraphs()));
        } catch (final GraphOperationException e) {
            throw new GaaSRestApiException("Bad Request", e.getMessage(), 400);
        }
    }
}
