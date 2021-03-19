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

import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
import uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules;
import uk.gov.gchq.gaffer.store.StoreProperties;
import java.util.HashMap;
import java.util.Map;

public class NewGraph {

    private GraphConfig config;
    private Map<String, String> storeProperties;

    public NewGraph config(final GraphConfig config) {
        this.config = config;
        return this;
    }

    public NewGraph storeProperties(final StoreType storeType) {
        switch (storeType) {
            case ACCUMULO: { // No AccumuloStoreProperties required for the graph
                // Instead, enableAccumulo() in the GraphSpec to enable Accumulo properties
                return this;
            }
            case FEDERATED_STORE: {
                this.storeProperties = getFederatedStoreProperties();
                return this;
            }
            case MAPSTORE:
                // Do nothing
                return this;
            default: {
                throw new IllegalArgumentException("Unsupported store type");
            }
        }
    }

    public GraphConfig getConfig() {
        return config;
    }

    public String getStorePropertyClassName() {
        if (storeProperties != null) {
            return storeProperties.get(StoreProperties.STORE_CLASS);
        }
        throw new IllegalStateException("NewGraph has not set any Store Properties");
    }

    private Map<String, String> getFederatedStoreProperties() {
        final Map<String, String> federatedStoreProperties = new HashMap<>();
        federatedStoreProperties.put(StoreProperties.STORE_CLASS, FederatedStore.class.getName());
        federatedStoreProperties.put(StoreProperties.STORE_PROPERTIES_CLASS, FederatedStoreProperties.class.getName());
        federatedStoreProperties.put(StoreProperties.JSON_SERIALISER_MODULES, SketchesJsonModules.class.getName());
        return federatedStoreProperties;
    }
}
