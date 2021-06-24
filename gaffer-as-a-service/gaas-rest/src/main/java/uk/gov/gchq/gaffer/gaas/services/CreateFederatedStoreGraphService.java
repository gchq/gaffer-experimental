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
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.client.graph.AddGraphsOperation;
import uk.gov.gchq.gaffer.gaas.client.graph.GraphCommandExecutor;
import uk.gov.gchq.gaffer.gaas.client.graph.ValidateGraphHostOperation;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.factories.GafferFactory;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GraphUrl;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.util.GaaSGraphConfigsLoader;
import java.util.ArrayList;
import java.util.List;

@Service
public class CreateFederatedStoreGraphService {

    private static final String CLASSPATH_CONFIG_YAML = "/config";
    private static final String[] GAFFER_STORE_CLASS_NESTED_KEYS = {"graph", "storeProperties", "gaffer.store.class"};

    @Autowired
    private CRDClient crdClient;
    @Autowired
    private GaaSGraphConfigsLoader loader;
    @Autowired
    private GraphCommandExecutor graphOperationExecutor;

    public void createFederatedStore(final GaaSCreateRequestBody request) throws GaaSRestApiException {
        if (request.getProxySubGraphs().isEmpty()) {
            throw new GaaSRestApiException("Bad Request", "There are no sub-graphs to add", 400);
        }

        validateProxyGraphURLs(request.getProxySubGraphs());

        // TODO #1: Get the GafferSpec config from GaaSGraphConfigsLoader by name
        final GafferSpec config = loader.getConfig(CLASSPATH_CONFIG_YAML, request.getConfigName());

        // TODO #2: Validate if the Config returned is a Federated store one, else throw BadRequest error
        if (!isFederatedStoreConfig(config)) {
            throw new GaaSRestApiException("Bad Request", "Graph is not a federated store", 400);
        }

        // TODO #3: Pass config in to the GafferFactory, more tests around this
        final GraphUrl url = crdClient.createCRD(GafferFactory.from(config, request));
        addSubGraphsToFederatedStore(url, request);
    }

    private void validateProxyGraphURLs(final List<ProxySubGraph> proxySubGraphs) throws GaaSRestApiException {
        final List<String> errorNotifications = new ArrayList<>();
        proxySubGraphs.stream()
                .forEach((proxySubGraph) -> {
                    try {
                        graphOperationExecutor.execute(new ValidateGraphHostOperation(proxySubGraph));
                    } catch (final GraphOperationException e) {
                        errorNotifications.add(proxySubGraph.getGraphId() + ": " + e.getMessage());
                    }
                });
        if (errorNotifications.size() > 0) {
            throw new GaaSRestApiException("Bad Request", "Invalid Proxy Graph URL(s): " + errorNotifications.toString(), 400);
        }
    }

    private void addSubGraphsToFederatedStore(final GraphUrl url, final GaaSCreateRequestBody request) throws GaaSRestApiException {
        try {
            graphOperationExecutor.execute(new AddGraphsOperation(url, request.getProxySubGraphs()));
        } catch (final GraphOperationException e) {
            throw new GaaSRestApiException("Failed to Add Graph(s) to \"" + request.getGraphId() + "\"", e.getMessage(), 502);
        }
    }

    private boolean isFederatedStoreConfig(final GafferSpec gafferSpec) {
        return gafferSpec != null
                && FederatedStore.class.getName().equals(gafferSpec.getNestedObject(GAFFER_STORE_CLASS_NESTED_KEYS));
    }
}
