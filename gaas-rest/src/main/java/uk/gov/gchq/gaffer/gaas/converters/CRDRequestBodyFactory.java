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

package uk.gov.gchq.gaffer.gaas.converters;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import uk.gov.gchq.gaffer.gaas.model.CreateCRDRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GafferHelmChartValues;
import uk.gov.gchq.gaffer.gaas.model.NewGraph;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import uk.gov.gchq.gaffer.graph.GraphConfig;

public final class CRDRequestBodyFactory {

    // todo fix injection
    private static final String GROUP = "gchq.gov.uk";
    private static final String VERSION = "v1";
    private static final String KIND = "Gaffer";

    public static CreateCRDRequestBody from(final GaaSCreateRequestBody graph) {

        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());

        return new CreateCRDRequestBody()
                .apiVersion(GROUP + "/" + VERSION)
                .kind(KIND)
                .metaData(metadata)
                .spec(makeGafferHelmChart(graph));
    }

    private static GafferHelmChartValues makeGafferHelmChart(final GaaSCreateRequestBody graph) {
        final StoreType storeType = graph.getStoreType();
        switch (storeType) {
            case ACCUMULO:
                return new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId(graph.getGraphId())
                                        .description(graph.getDescription())
                                        .library(null)
                                        .build()))
                        .enableAccumulo()
                        .build();
            case FEDERATED_STORE:
            case MAPSTORE:
                return new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId(graph.getGraphId())
                                        .description(graph.getDescription())
                                        .library(null)
                                        .build())
                                .storeProperties(storeType))
                        .build();
            default:
                throw new IllegalArgumentException("Unsupported store type");
        }
    }

    private CRDRequestBodyFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
