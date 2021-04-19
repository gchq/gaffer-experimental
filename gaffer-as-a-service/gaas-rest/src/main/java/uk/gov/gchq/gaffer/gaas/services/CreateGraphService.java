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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GraphSpec;
import uk.gov.gchq.gaffer.gaas.model.NewGraph;
import uk.gov.gchq.gaffer.graph.GraphConfig;

@Service
public class CreateGraphService {

    @Autowired
    private ApiClient apiClient;

    @Autowired
    private CRDClient crdClient;
    @Value("${group}")
    private String group;
    @Value("${version}")
    private String version;
    @Value("${kind}")
    private String kind;

    public void createGraph(final GaaSCreateRequestBody gaaSCreateRequestBodyInput) throws GaaSRestApiException {
        crdClient.createCRD(buildCreateCRDRequestBody(gaaSCreateRequestBodyInput));
    }

    private CRDCreateRequestBody buildCreateCRDRequestBody(final GaaSCreateRequestBody graph) {
        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());

        return new CRDCreateRequestBody()
                .apiVersion(group + "/" + version)
                .kind(kind)
                .metaData(metadata)
                .spec(new GraphSpec()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId(graph.getGraphId())
                                        .description(graph.getDescription())
                                        .library(null)
                                        .build())));
    }
}
