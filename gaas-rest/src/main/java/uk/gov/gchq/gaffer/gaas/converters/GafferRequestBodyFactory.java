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
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.StoreType;

public final class GafferRequestBodyFactory {

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
                .spec(createGafferSpec(graph));
    }

    private static GafferSpec createGafferSpec(final GaaSCreateRequestBody graph) {
        final StoreType storeType = graph.getStoreType();
        switch (storeType) {
            case ACCUMULO: {
                final GafferSpec gafferSpec = new GafferSpec();
                gafferSpec.putNestedObject(graph.getGraphId(), "graph", "config", "graphId");
                gafferSpec.putNestedObject("{}", "graph", "config", "library");
                gafferSpec.putNestedObject(graph.getDescription(), "graph", "config", "description");
                gafferSpec.putNestedObject("[]", "graph", "config", "hooks");
                gafferSpec.putNestedObject(true, "accumulo", "enabled");
                return gafferSpec;
            }
            case FEDERATED_STORE: {
                final GafferSpec gafferSpec = new GafferSpec();
                gafferSpec.putNestedObject(graph.getGraphId(), "graph", "config", "graphId");
                gafferSpec.putNestedObject("{}", "graph", "config", "library");
                gafferSpec.putNestedObject(graph.getDescription(), "graph", "config", "description");
                gafferSpec.putNestedObject("[]", "graph", "config", "hooks");
                gafferSpec.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
                gafferSpec.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
                gafferSpec.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
                return gafferSpec;
            }
            case MAPSTORE: {
                final GafferSpec gafferSpec = new GafferSpec();
                gafferSpec.putNestedObject(graph.getGraphId(), "graph", "config", "graphId");
                gafferSpec.putNestedObject("{}", "graph", "config", "library");
                gafferSpec.putNestedObject(graph.getDescription(), "graph", "config", "description");
                gafferSpec.putNestedObject("[]", "graph", "config", "hooks");
                gafferSpec.putNestedObject(true, "graph", "storeProperties", "gaffer.store.job.tracker.enabled");
                gafferSpec.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", "graph", "storeProperties", "gaffer.cache.service.class");
                return gafferSpec;
            }
            default:
                throw new IllegalArgumentException("Unsupported store type");
        }
    }

    private GafferRequestBodyFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
