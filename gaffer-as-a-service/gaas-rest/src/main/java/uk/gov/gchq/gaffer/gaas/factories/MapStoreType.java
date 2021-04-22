/*
 *
 *  * Copyright 2021 Crown Copyright
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package uk.gov.gchq.gaffer.gaas.factories;

import com.google.gson.Gson;
import uk.gov.gchq.gaffer.cache.impl.HashMapCacheService;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties.CACHE_SERVICE_CLASS;
import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
import static uk.gov.gchq.gaffer.store.StoreProperties.JOB_TRACKER_ENABLED;

public class MapStoreType implements StoreType {
    @Override
    public String getType() {
        return "mapStore";
    }

    @Override
    public AbstractStoreTypeBuilder getStoreSpecBuilder() {
        return new MapStoreSpecBuilder();
    }

    private static class MapStoreSpecBuilder extends AbstractStoreTypeBuilder {
        private Object schema;
        @Override
        public AbstractStoreTypeBuilder setStoreSpec(List<String> storeSpec) {
            this.gafferSpecBuilder.setStoreSpec(storeSpec);
            return this;
        }

        public AbstractStoreTypeBuilder setSchema(final Object schema) {
            gafferSpecBuilder.setSchema(schema);
            this.schema=schema;
            return this;
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
            gafferSpec.putNestedObject(new Gson().toJson(schema), SCHEMA_FILE_KEY);
            gafferSpec.putNestedObject(getDefaultMapStoreProperties(), STORE_PROPERTIES_KEY);
            return gafferSpec;
        }
    }
}
