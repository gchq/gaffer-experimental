/*
 * Copyright 2021 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraphConfigSpec;
import uk.gov.gchq.gaffer.gaas.util.GaaSGraphConfigsLoader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public final class GetGaaSGraphConfigsService {

    private static final String CLASSPATH_CONFIG_YAML = "/config";
    private static final String[] GAFFER_STORE_CLASS_NESTED_KEYS = {"graph", "storeProperties", "gaffer.store.class"};

    @Autowired
    private GaaSGraphConfigsLoader loader;

    public List<GaaSGraphConfigSpec> getGafferConfigSpecs() throws GaaSRestApiException {
        final Map<String, GafferSpec> gafferSpecMap = loader.listConfigSpecs(CLASSPATH_CONFIG_YAML);

        final List<GaaSGraphConfigSpec> gaaSGraphConfigSpecs = new ArrayList<>();

        gafferSpecMap.forEach((configName, gafferSpec) -> {
            if (isFederatedStoreConfig(gafferSpec)) {
                gaaSGraphConfigSpecs.add(new GaaSGraphConfigSpec(configName, new String[] {"proxies"}));
            } else {
                gaaSGraphConfigSpecs.add(new GaaSGraphConfigSpec(configName, new String[] {"schema"}));
            }
        });

        return gaaSGraphConfigSpecs;
    }

    private boolean isFederatedStoreConfig(final GafferSpec gafferSpec) {
        return gafferSpec != null
                && FederatedStore.class.getName().equals(gafferSpec.getNestedObject(GAFFER_STORE_CLASS_NESTED_KEYS));
    }
}
