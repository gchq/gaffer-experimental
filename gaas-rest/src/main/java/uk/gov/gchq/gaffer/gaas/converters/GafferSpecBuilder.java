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

import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import javax.annotation.Resource;

public class GafferSpecBuilder {
    final GafferSpec gafferSpec = new GafferSpec();

    public void commonSetup(final GaaSCreateRequestBody graph) {
        gafferSpec.putNestedObject(graph.getGraphId(), "graph", "config", "graphId");
        gafferSpec.putNestedObject(graph.getDescription(), "graph", "config", "description");
    }

    public GafferSpec createAccumuloRequest(final GaaSCreateRequestBody graph) {
        commonSetup(graph);
        gafferSpec.putNestedObject(true, "accumulo", "enabled");
        return gafferSpec;
    }

    public GafferSpec createFederatedRequest(final GaaSCreateRequestBody graph) {
        commonSetup(graph);
        gafferSpec.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
        gafferSpec.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
        gafferSpec.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
        return gafferSpec;
    }

    public GafferSpec createMapStoreRequest(final GaaSCreateRequestBody graph) {
        commonSetup(graph);
        gafferSpec.putNestedObject(true, "graph", "storeProperties", "gaffer.store.job.tracker.enabled");
        gafferSpec.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", "graph", "storeProperties", "gaffer.cache.service.class");
        return gafferSpec;
    }


}
