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

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.gaas.model.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.Graph;

import java.util.HashMap;

@Service
public class CreateGraphService {

    @Autowired
    private ApiClient apiClient;

    @Autowired
    private CRDClient crdClient;

    public void createGraph(final Graph graphInput) throws GaaSRestApiException {
        GafferSpec spec = new GafferSpec();
        HashMap<String, String> config = new HashMap<>();
        config.put("graphId", graphInput.getGraphId());
        config.put("description", graphInput.getDescription());
        HashMap<HashMap, String> graph = new HashMap<>();
        graph.put(config, "config");
        boolean graph1 = spec.putNestedObject(graph, "graph");
        V1ObjectMeta metadata = new V1ObjectMeta().name(graphInput.getGraphId());
        Gaffer gaffer = new Gaffer().apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(spec);

        crdClient.createCRD(gaffer);
    }
}
