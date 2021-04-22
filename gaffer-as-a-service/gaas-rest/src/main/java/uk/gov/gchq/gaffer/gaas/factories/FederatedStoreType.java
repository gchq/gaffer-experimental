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

import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
import uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
import static uk.gov.gchq.gaffer.jsonserialisation.JSONSerialiser.JSON_SERIALISER_MODULES;
import static uk.gov.gchq.gaffer.store.StoreProperties.STORE_CLASS;
import static uk.gov.gchq.gaffer.store.StoreProperties.STORE_PROPERTIES_CLASS;

@Service
public class FederatedStoreType implements StoreType {
    @Override
    public String getType() {
        return "federatedStore";
    }

    @Override
    public AbstractStoreTypeBuilder getStoreSpecBuilder(final GaaSCreateRequestBody graph) {
        return new FederatedStoreSpecBuilder(graph);
    }


    private static final class FederatedStoreSpecBuilder extends AbstractStoreTypeBuilder {
        private GaaSCreateRequestBody graph;

        private FederatedStoreSpecBuilder(final GaaSCreateRequestBody graph) {
            this.graph = graph;
        }

        @Override
        public AbstractStoreTypeBuilder setStoreSpec(final List<String> storeSpec) {
            this.gafferSpecBuilder.setStoreSpec(storeSpec);
            return this;
        }

        private Map<String, Object> getDefaultFederatedStoreProperties() {
            final Map<String, Object> federatedStoreProperties = new HashMap<>();
            federatedStoreProperties.put(STORE_CLASS, FederatedStore.class.getName());
            federatedStoreProperties.put(STORE_PROPERTIES_CLASS, FederatedStoreProperties.class.getName());
            federatedStoreProperties.put(JSON_SERIALISER_MODULES, SketchesJsonModules.class.getName());
            return federatedStoreProperties;
        }

        @Override
        public GafferSpec build() {
            final GafferSpec gafferSpec = super.build();
            gafferSpec.putNestedObject(getDefaultFederatedStoreProperties(), STORE_PROPERTIES_KEY);
            return gafferSpec;
        }
    }
}
