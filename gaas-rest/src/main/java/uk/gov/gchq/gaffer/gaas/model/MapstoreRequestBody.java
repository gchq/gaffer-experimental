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

package uk.gov.gchq.gaffer.gaas.model;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import uk.gov.gchq.gaffer.graph.GraphConfig;

public class MapstoreRequestBody implements CRDRequestBodyInterface {
    private String group = "gchq.gov.uk";
    private String version = "v1";
    private String kind = "Gaffer";
    @Override
    public CreateCRDRequestBody buildRequestBody(final GaaSCreateRequestBody graph) {
        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());
        return new CreateCRDRequestBody()
                .apiVersion(group + "/" + version)
                .kind(kind)
                .metaData(metadata)
                .spec(new GraphSpec.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId(graph.getGraphId())
                                        .description(graph.getDescription())
                                        .library(null)
                                        .build()))
                .build());
    }
}
