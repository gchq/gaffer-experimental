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
import org.springframework.web.reactive.function.client.WebClient;
import uk.gov.gchq.gaffer.commonutil.ToStringBuilder;
import uk.gov.gchq.gaffer.gaas.client.AddGraphsCommand;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.client.GraphCommandExecutor;
import uk.gov.gchq.gaffer.gaas.client.PingGraphStatusCommand;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import java.util.ArrayList;
import java.util.List;
import static uk.gov.gchq.gaffer.gaas.factories.GafferHelmValuesFactory.from;

@Service
public class CreateFederatedStoreGraphService {

    @Autowired
    private CRDClient crdClient;

    @Autowired
    private WebClient.Builder webClientBuilder;

    public void createFederatedStore(final FederatedRequestBody parentFederatedGraph) throws GaaSRestApiException {

        if (parentFederatedGraph.getProxySubGraphs().isEmpty()) {
            throw new GaaSRestApiException("Bad Request", "There are no sub-graphs to add", 400);
        }
        // check if child graphs to add all are valid (URLs)
        final GraphCommandExecutor graphCommandExecutor = new GraphCommandExecutor();
        final StringBuilder exceptionList = new StringBuilder();
        parentFederatedGraph.getProxySubGraphs().stream()
                .forEach((proxySubGraph) -> {
                    final WebClient webClient = webClientBuilder.baseUrl(proxySubGraph.getHost()).build();
                    try {
                        graphCommandExecutor.execute(new PingGraphStatusCommand(webClient));
                    } catch (GaaSRestApiException e) {
                        exceptionList.append(proxySubGraph.getGraphId());
                    }
                });
        if (exceptionList.length() > 0) {
            throw new GaaSRestApiException("Bad Request", "The following graphs have invalid URLs: " + exceptionList.toString(), 400);
        }
        // 1) Create parentFedGraph
        // 1) Get the URL of the parentFedGraph

        crdClient.createCRD(from(parentFederatedGraph));
        // 1) Check if parentFedGraph URL is valid
        // 1) send a request to parentFedGraph containing child-graph URLs to add
        // 1) check if child-graph got added to fed store correctly

        // Send operations to Graph
//        final String url = crdClient.getCRDByGraphId(federatedGraph.getGraphId()).getUrl();


        // Check if Graph is up

        // Add Graphs to federated store graph
//        graphCommandExecutor.execute(new AddGraphsCommand(webClient, parentFederatedGraph.getProxySubGraphs()));

        // Disable AddGraph operation on graph
//        graphCommandExecutor.execute(new DisableAddGraphOperationCommand(webClient));
    }
}
