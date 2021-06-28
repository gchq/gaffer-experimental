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

package uk.gov.gchq.gaffer.gaas.util;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
public class GafferSpecConfigsLoaderTest {

    private static final String[] GAFFER_STORE_CLASS_NESTED_KEYS = {"graph", "storeProperties", "gaffer.store.class"};
    private static final String[] GAFFER_STORE_JOB_TRACKER_ENABLED_NESTED_KEYS = {"graph", "storeProperties", "gaffer.store.job.tracker.enabled"};
    private static final String[] GAFFER_CACHE_SERVICE_CLASS_NESTED_KEYS = {"graph", "storeProperties", "gaffer.cache.service.class"};

    private static final String[] GAFFER_STORE_PROPERTIES_CLASS_NESTED_KEYS = {"graph", "storeProperties", "uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties"};
    private static final String[] GAFFER_SERIALISER_JSON_NESTED_KEYS = {"graph", "storeProperties", "uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules"};

    private static final String[] GAFFER_INVALID_STORE_CLASS_NESTED_KEYS = {"graph", "invalidStoreProperties", "gaffer.store.class"};
    private static final String[] GAFFER_INVALID_STORE_JOB_TRACKER_ENABLED_NESTED_KEYS = {"graph", "invalidStoreProperties", "gaffer.store.job.tracker.enabled"};
    private static final String[] GAFFER_INVALID_STORE_CACHE_SERVICE_CLASS_NESTED_KEYS = {"graph", "invalidStoreProperties", "gaffer.cache.service.class"};

    private static final String[] GAFFER_HOST_NESTED_KEYS = {"graph", "storeProperties", "gaffer.host"};
    private static final String[] GAFFER_CONTEXT_ROOT_NESTED_KEYS = {"graph", "storeProperties", "gaffer.context-root"};

    @Autowired
    private GafferSpecConfigsLoader loader;

    @Test
    public void getConfig_shouldReturnNewGafferSpec_whenFileIsEmpty() throws GaaSRestApiException {
        final GafferSpec actual = loader.getConfig("/invalidconfigs", "emptyConfig");

        final GafferSpec expected = new GafferSpec();
        assertEquals(expected, actual);
    }

    @Test
    public void getConfig_shouldReturnConfigAsYamlTreeMap_whenFileNameExists() throws GaaSRestApiException {
        final GafferSpec actual = loader.getConfig("/testconfigs", "accumulo");

        final GafferSpec expected = new GafferSpec();
        expected.putNestedObject(true, "accumulo", "enabled");
        assertEquals(expected, actual);
    }

    @Test
    public void getConfig_shouldThrowNotFoundGaaSException_whenConfigFileDoesNotExist() {
        final GaaSRestApiException
                exception = assertThrows(GaaSRestApiException.class, () -> loader.getConfig("/testconfigs", "doesnotexist_config"));

        final GaaSRestApiException expected = new GaaSRestApiException("GaaS Graph Config Not Found", "Available config names are: accumulo, federated, mapStore, proxy, proxyNoContextRoot", 404);
        assertEquals(expected, exception);
    }

    @Test
    public void listConfigSpecs_shouldReturnProxiesConfigSpec_whenStorePropStoreClassIsFederatedStore() throws GaaSRestApiException {
        final Map<String, GafferSpec> specs = loader.listConfigSpecs("/testconfigs");

        final HashMap<String, GafferSpec> expected = new HashMap();

        final GafferSpec gafferSpecProxyStore = new GafferSpec();
        gafferSpecProxyStore.putNestedObject("uk.gov.gchq.gaffer.proxystore.ProxyStore", GAFFER_STORE_CLASS_NESTED_KEYS);
        gafferSpecProxyStore.putNestedObject("http://my.graph.co.uk", GAFFER_HOST_NESTED_KEYS);
        gafferSpecProxyStore.putNestedObject("/rest", GAFFER_CONTEXT_ROOT_NESTED_KEYS);
        expected.put("proxy", gafferSpecProxyStore);

        final GafferSpec gafferSpecFederatedStore = new GafferSpec();
        gafferSpecFederatedStore.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", GAFFER_STORE_CLASS_NESTED_KEYS);
        gafferSpecFederatedStore.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", GAFFER_STORE_PROPERTIES_CLASS_NESTED_KEYS);
        gafferSpecFederatedStore.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", GAFFER_SERIALISER_JSON_NESTED_KEYS);
        expected.put("federated", gafferSpecFederatedStore);

        final GafferSpec gafferSpecAccumulo = new GafferSpec();
        gafferSpecAccumulo.putNestedObject(true, "accumulo", "enabled");
        expected.put("accumulo", gafferSpecAccumulo);

        final GafferSpec gafferSpecMapStore = new GafferSpec();
        gafferSpecMapStore.putNestedObject("uk.gov.gchq.gaffer.mapstore.MapStore", GAFFER_STORE_CLASS_NESTED_KEYS);
        gafferSpecMapStore.putNestedObject(true, GAFFER_STORE_JOB_TRACKER_ENABLED_NESTED_KEYS);
        gafferSpecMapStore.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", GAFFER_CACHE_SERVICE_CLASS_NESTED_KEYS);
        expected.put("mapStore", gafferSpecMapStore);

        final GafferSpec gafferSpecNoContextProxyStore = new GafferSpec();
        gafferSpecNoContextProxyStore.putNestedObject("uk.gov.gchq.gaffer.proxystore.ProxyStore", GAFFER_STORE_CLASS_NESTED_KEYS);
        gafferSpecNoContextProxyStore.putNestedObject("http://my.graph.co.uk", GAFFER_HOST_NESTED_KEYS);
        expected.put("proxyNoContextRoot", gafferSpecNoContextProxyStore);

        assertEquals(expected.keySet(), specs.keySet());
    }

    @Test
    public void listConfigSpecs_shouldReturnSchemaConfigSpecsAsDefault_forAnyInvalidConfigSpecs() throws GaaSRestApiException {
        final Map<String, GafferSpec> specs = loader.listConfigSpecs("/invalidconfigs");

        final HashMap<String, GafferSpec> expected = new HashMap<>();

        final GafferSpec emptyStoreValueSpec = new GafferSpec();
        emptyStoreValueSpec.putNestedObject(null, GAFFER_STORE_CLASS_NESTED_KEYS);
        expected.put("emptyStoreClassValue", emptyStoreValueSpec);

        final GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject("uk.gov.gchq.gaffer.mapstore.MapStore", GAFFER_INVALID_STORE_CLASS_NESTED_KEYS);
        gafferSpec.putNestedObject(true, GAFFER_INVALID_STORE_JOB_TRACKER_ENABLED_NESTED_KEYS);
        gafferSpec.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", GAFFER_INVALID_STORE_CACHE_SERVICE_CLASS_NESTED_KEYS);
        expected.put("invalidConfig", gafferSpec);

        expected.put("emptyConfig", new GafferSpec());
        assertEquals(expected, specs);
    }
}
