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

import com.google.gson.Gson;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.cache.impl.HashMapCacheService;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import java.util.HashMap;
import java.util.Map;
import static uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties.CACHE_SERVICE_CLASS;
import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
import static uk.gov.gchq.gaffer.store.StoreProperties.JOB_TRACKER_ENABLED;

@Service
public class MapStoreType implements StoreType {

    @Override
    public String getType() {
        return "mapStore";
    }

    @Override
    public AbstractStoreTypeBuilder getStoreSpecBuilder(final GaaSCreateRequestBody graph) {
        return new MapStoreSpecBuilder(graph);
    }

    private static final class MapStoreSpecBuilder extends AbstractStoreTypeBuilder {

        private MapStoreSpecBuilder(final GaaSCreateRequestBody graph) {
            this.graph = graph;
        }

        private Map<String, Object> getDefaultMapStoreProperties() {
            final Map<String, Object> mapStoreProperties = new HashMap<>();
            mapStoreProperties.put(CACHE_SERVICE_CLASS, HashMapCacheService.class.getName());
            mapStoreProperties.put(JOB_TRACKER_ENABLED, true);
            return mapStoreProperties;
        }

        @Override
        public GafferSpec build() {
            final GafferSpec gafferSpec = super.build();
            gafferSpec.putNestedObject(new Gson().toJson(graph.getSchema()), SCHEMA_FILE_KEY);
            gafferSpec.putNestedObject(getDefaultMapStoreProperties(), STORE_PROPERTIES_KEY);
            return gafferSpec;
        }
    }
}
