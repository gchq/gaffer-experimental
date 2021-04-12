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

package uk.gov.gchq.gaffer.gaas.factories;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.StoreType;

/**
 * GafferHelmValuesFactory is a factory class that creates a Gaffer Helm Values Object that can be passed to the
 * Kubernetes java client and use helm to deploy a Gaffer custom resource instance to a Kubernetes cluster..
 * <p>
 * See <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values.yaml">values.yaml</a> for
 * the default helm chart values and documentation how Gaffer is deployed to Kubernetes via helm.
 *
 * @see <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values-federated.yaml">Federated Store overrides</a>
 * for more Gaffer store configuration overrides:
 */
public final class GafferHelmValuesFactory {

    // todo fix injection
    private static final String GROUP = "gchq.gov.uk";
    private static final String VERSION = "v1";
    private static final String KIND = "Gaffer";

    public static Gaffer from(final GaaSCreateRequestBody graph) {

        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());

        return new Gaffer()
                .apiVersion(GROUP + "/" + VERSION)
                .kind(KIND)
                .metaData(metadata)
                .spec(createGafferSpecFrom(graph));
    }

    private static GafferSpec createGafferSpecFrom(final GaaSCreateRequestBody graph) {
        final StoreType storeType = graph.getStoreType();

        switch (storeType) {
            case ACCUMULO:
                return new AccumuloGafferSpecBuilder()
                        .graphId(graph.getGraphId())
                        .description(graph.getDescription())
                        .schema(graph.getSchema())
                        .build();
            case FEDERATED_STORE:
            case MAPSTORE:
                return new GafferSpecBuilder()
                        .graphId(graph.getGraphId())
                        .description(graph.getDescription())
                        .schema(graph.getSchema())
                        .storeProperties(storeType)
                        .build();
            case PROXY_STORE:
                return new GafferSpecBuilder()
                        .graphId(graph.getGraphId())
                        .description(graph.getDescription())
                        .schema(graph.getSchema())
                        .storeProperties(storeType, graph.getProxyHost(), graph.getProxyContextRoot())
                        .build();
            default:
                throw new IllegalArgumentException("Unsupported store type");
        }
    }

    private GafferHelmValuesFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
