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

package uk.gov.gchq.gaffer.gaas.stores;

import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import uk.gov.gchq.gaffer.proxystore.ProxyStore;
import java.util.HashMap;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
import static uk.gov.gchq.gaffer.proxystore.ProxyProperties.GAFFER_CONTEXT_ROOT;
import static uk.gov.gchq.gaffer.proxystore.ProxyProperties.GAFFER_HOST;
import static uk.gov.gchq.gaffer.store.StoreProperties.STORE_CLASS;

@Service
public class ProxyStoreSpec implements StoreSpec {

    @Override
    public StoreType getType() {
        return StoreType.PROXY_STORE;
    }

    @Override
    public AbstractStoreTypeBuilder getStoreSpecBuilder() {
        return new ProxyStoreSpecBuilder();
    }

    private static class ProxyStoreSpecBuilder extends AbstractStoreTypeBuilder {

        private Map<String, Object> getDefaultProxyStoreProperties() {
            final Map<String, Object> graphStoreProperties = getProperties();
            final Map<String, Object> proxyStoreProperties = new HashMap<>();
            proxyStoreProperties.put(STORE_CLASS, ProxyStore.class.getName());
            proxyStoreProperties.put(GAFFER_HOST, graphStoreProperties.get("proxyHost"));
            if (graphStoreProperties.containsKey("proxyContextRoot")) {
                proxyStoreProperties.put(GAFFER_CONTEXT_ROOT, graphStoreProperties.get("proxyContextRoot"));
                // else, let Gaffer handle the default context root when not specified in GaaS REST request
            }
            return proxyStoreProperties;
        }

        @Override
        public GafferSpec build() {
            final GafferSpec gafferSpec = super.build();
            gafferSpec.putNestedObject(getDefaultProxyStoreProperties(), STORE_PROPERTIES_KEY);
            return gafferSpec;
        }

    }
}
