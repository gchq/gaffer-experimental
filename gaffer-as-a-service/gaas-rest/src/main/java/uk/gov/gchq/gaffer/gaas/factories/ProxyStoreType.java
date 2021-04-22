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

import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.proxystore.ProxyStore;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
import static uk.gov.gchq.gaffer.proxystore.ProxyProperties.GAFFER_CONTEXT_ROOT;
import static uk.gov.gchq.gaffer.proxystore.ProxyProperties.GAFFER_HOST;
import static uk.gov.gchq.gaffer.store.StoreProperties.STORE_CLASS;

@Service
public class ProxyStoreType implements StoreType {
    @Override
    public String getType() {
        return "proxyStore";
    }

    @Override
    public AbstractStoreTypeBuilder getStoreSpecBuilder(final GaaSCreateRequestBody graph) {
        return new ProxyStoreSpecBuilder(graph);
    }

    private static class ProxyStoreSpecBuilder extends AbstractStoreTypeBuilder {
        private GaaSCreateRequestBody graph;

        public ProxyStoreSpecBuilder(GaaSCreateRequestBody graph) {
            this.graph = graph;
        }

        @Override
        public AbstractStoreTypeBuilder setStoreSpec(List<String> storeSpec) {
            this.gafferSpecBuilder.setStoreSpec(storeSpec);
            return this;
        }

        private Map<String, Object> getDefaultProxyStoreProperties(final String host, final String contextRoot) {
            final Map<String, Object> proxyStoreProperties = new HashMap<>();
            proxyStoreProperties.put(STORE_CLASS, ProxyStore.class.getName());
            proxyStoreProperties.put(GAFFER_HOST, host);
            if (contextRoot != null) {
                proxyStoreProperties.put(GAFFER_CONTEXT_ROOT, contextRoot);
                // else, let Gaffer handle the default context root when not specified in GaaS REST request
            }
            return proxyStoreProperties;
        }

        @Override
        public GafferSpec build() {
            final GafferSpec gafferSpec = super.build();
            gafferSpec.putNestedObject(getDefaultProxyStoreProperties(graph.getProxyHost(),graph.getProxyContextRoot()), STORE_PROPERTIES_KEY);
            return gafferSpec;
        }

    }
}
