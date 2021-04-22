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

//import com.google.gson.Gson;
//import uk.gov.gchq.gaffer.cache.impl.HashMapCacheService;
//import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
//import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
//import uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties;
//import uk.gov.gchq.gaffer.gaas.model.StoreType;
//import uk.gov.gchq.gaffer.proxystore.ProxyStore;
//import uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules;
//import java.util.HashMap;
//import java.util.Map;
//import static uk.gov.gchq.gaffer.cache.util.CacheProperties.CACHE_SERVICE_CLASS;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
//import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
//import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;
//import static uk.gov.gchq.gaffer.proxystore.ProxyProperties.GAFFER_CONTEXT_ROOT;
//import static uk.gov.gchq.gaffer.proxystore.ProxyProperties.GAFFER_HOST;
//import static uk.gov.gchq.gaffer.store.StoreProperties.JOB_TRACKER_ENABLED;
//import static uk.gov.gchq.gaffer.store.StoreProperties.JSON_SERIALISER_MODULES;
//import static uk.gov.gchq.gaffer.store.StoreProperties.STORE_CLASS;
//import static uk.gov.gchq.gaffer.store.StoreProperties.STORE_PROPERTIES_CLASS;
//
//public class GafferSpecBuilder {
//
//    protected final GafferSpec gafferSpec = new GafferSpec();
//
//    public GafferSpecBuilder graphId(final String graphId) {
//        gafferSpec.putNestedObject(graphId, GRAPH_ID_KEY);
//        return this;
//    }
//
//    public GafferSpecBuilder description(final String description) {
//        gafferSpec.putNestedObject(description, DESCRIPTION_KEY);
//        return this;
//    }
//
//    public GafferSpecBuilder schema(final Object schema) {
//        gafferSpec.putNestedObject(new Gson().toJson(schema), SCHEMA_FILE_KEY);
//        return this;
//    }
//
//    public GafferSpecBuilder storeProperties(final StoreType storeType) {
//        storeProperties(storeType, null, null);
//        return this;
//    }
//
//    public GafferSpecBuilder storeProperties(final StoreType storeType, final String host, final String contextRoot) {
//        switch (storeType) {
//            case FEDERATED_STORE:
//                gafferSpec.putNestedObject(getDefaultFederatedStoreProperties(), STORE_PROPERTIES_KEY);
//                return this;
//            case MAPSTORE:
//                gafferSpec.putNestedObject(getDefaultMapStoreProperties(), STORE_PROPERTIES_KEY);
//                return this;
//            case PROXY_STORE:
//                if (host == null) {
//                    throw new IllegalArgumentException("Host is required to create a proxy store to proxy");
//                }
//                gafferSpec.putNestedObject(getDefaultProxyStoreProperties(host, contextRoot), "graph", "storeProperties");
//                return this;
//            default:
//                throw new IllegalArgumentException("Unsupported store type");
//        }
//    }
//
//    public GafferSpecBuilder ingress(final String graphId) {
//        gafferSpec.putNestedObject(graphId.toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
//        gafferSpec.putNestedObject("/rest", INGRESS_API_PATH_KEY);
//        gafferSpec.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
//        return this;
//    }
//
//    public GafferSpec build() {
//        return gafferSpec;
//    }
//
//    private Map<String, Object> getDefaultFederatedStoreProperties() {
//        final Map<String, Object> federatedStoreProperties = new HashMap<>();
//        federatedStoreProperties.put(STORE_CLASS, FederatedStore.class.getName());
//        federatedStoreProperties.put(STORE_PROPERTIES_CLASS, FederatedStoreProperties.class.getName());
//        federatedStoreProperties.put(JSON_SERIALISER_MODULES, SketchesJsonModules.class.getName());
//        return federatedStoreProperties;
//    }
//
//    private Map<String, Object> getDefaultMapStoreProperties() {
//        final Map<String, Object> mapStoreProperties = new HashMap<>();
//        mapStoreProperties.put(CACHE_SERVICE_CLASS, HashMapCacheService.class.getName());
//        mapStoreProperties.put(JOB_TRACKER_ENABLED, true);
//        return mapStoreProperties;
//    }
//
//    private Map<String, Object> getDefaultProxyStoreProperties(final String host, final String contextRoot) {
//        final Map<String, Object> proxyStoreProperties = new HashMap<>();
//        proxyStoreProperties.put(STORE_CLASS, ProxyStore.class.getName());
//        proxyStoreProperties.put(GAFFER_HOST, host);
//        if (contextRoot != null) {
//            proxyStoreProperties.put(GAFFER_CONTEXT_ROOT, contextRoot);
//            // else, let Gaffer handle the default context root when not specified in GaaS REST request
//        }
//        return proxyStoreProperties;
//    }
//}

import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import java.util.List;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;

public class GafferSpecBuilder {

    private String id;
    private String description;
    private List<String> storeSpec;

    public void setId(final String id) {
        this.id = id;
    }

    public void setDescription(final String description){
        this.description = description;
    }

    public void setStoreSpec(final List<String> storeSpec) {
        this.storeSpec = storeSpec;
    }



    // ingest, etc

    public GafferSpec build() {
        final GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject(this.id, GRAPH_ID_KEY);
        gafferSpec.putNestedObject(description, DESCRIPTION_KEY);
        storeSpec.forEach(o -> gafferSpec.putNestedObject(o, "store", "spec"));
        // etc
        return gafferSpec;
    }
}
