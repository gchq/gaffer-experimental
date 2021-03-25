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
package uk.gov.gchq.gaffer.gaas.utilities;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.CreateCRDRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;

public final class CRDCreateRequestTestFactory {

    public static Gaffer makeCreateCRDRequestBody(final GaaSCreateRequestBody graph) {
        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());
        final GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject(graph.getGraphId(), "graph", "config", "graphId");
        gafferSpec.putNestedObject("{}", "graph", "config", "library");
        gafferSpec.putNestedObject(graph.getDescription(), "graph", "config", "description");
        gafferSpec.putNestedObject("[]", "graph", "config", "hooks");
        gafferSpec.putNestedObject(true, "accumulo", "enabled");
        return new Gaffer()
                .apiVersion("gchq.gov.uk" + "/" + "v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(gafferSpec);

//        return new CreateCRDRequestBody()
//                .apiVersion("gchq.gov.uk/v1")
//                .kind("Gaffer")
//                .metaData(metadata)
//                .spec(new GafferHelmChartValues.Builder()
//                        .enableAccumulo()
//                        .graph(new NewGraph()
//                                .config(new GraphConfig.Builder()
//                                        .graphId(graph.getGraphId())
//                                        .description(graph.getDescription())
//                                        .library(null)
//                                        .build()))
//                .build());
    }

    private CRDCreateRequestTestFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
