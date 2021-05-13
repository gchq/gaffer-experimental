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

package uk.gov.gchq.gaffer.gaas.factories;

import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import uk.gov.gchq.gaffer.gaas.stores.AbstractStoreTypeBuilder;
import uk.gov.gchq.gaffer.gaas.stores.AccumuloStoreSpec;
import uk.gov.gchq.gaffer.gaas.stores.FederatedStoreSpec;
import uk.gov.gchq.gaffer.gaas.stores.MapStoreSpec;
import uk.gov.gchq.gaffer.gaas.stores.ProxyStoreSpec;
import uk.gov.gchq.gaffer.gaas.stores.StoreSpec;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
class StoreTypeFactoryTest {

    @Test
    void testGetProxyStoreBuilder() {
        final List<StoreSpec> storeTypeManager = makeStoreList();
        StoreTypeFactory storeTypeFactory = new StoreTypeFactory(storeTypeManager);
        AbstractStoreTypeBuilder builder = storeTypeFactory.getBuilder(StoreType.PROXY_STORE);

        GafferSpec build = builder.setGraphId("mygraph").setDescription("Another description").setProperties(getStoreProperties()).build();

        final String expected =
                "{graph={storeProperties={gaffer.host=http://my.graph.co.uk, gaffer.store.class=uk.gov.gchq.gaffer" +
                        ".proxystore.ProxyStore}, config={description=Another description, graphId=mygraph}}, ingress" +
                        "={host=mygraph-kai-dev.apps.my.kubernetes.cluster, pathPrefix={ui=/ui, api=/rest}}}";
        assertEquals(expected, build.toString());
    }

    @Test
    void testGetMapStoreBuilder() {
        final List<StoreSpec> storeTypeManager = makeStoreList();
        StoreTypeFactory storeTypeFactory = new StoreTypeFactory(storeTypeManager);
        AbstractStoreTypeBuilder builder = storeTypeFactory.getBuilder(StoreType.MAP_STORE);

        GafferSpec build = builder.setGraphId("mygraph").setDescription("Another description").setSchema(getSchema()).build();

        final String expected = "{graph={schema={schema.json={\"entities\":{},\"edges\":{},\"types\":{}}}, storeProperties" +
                "={gaffer.store.job.tracker.enabled=true, gaffer.cache.service.class=uk.gov.gchq.gaffer.cache.impl" +
                ".HashMapCacheService}, config={description=Another description, graphId=mygraph}}, ingress={host=mygraph-kai-dev.apps.my.kubernetes.cluster, pathPrefix={ui=/ui, api=/rest}}}";
        assertEquals(expected, build.toString());
    }

    @Test
    void testGetInvalidStoreBuilder() {
        final List<StoreSpec> storeTypeManager = makeStoreList();
        StoreTypeFactory storeTypeFactory = new StoreTypeFactory(storeTypeManager);

        final RuntimeException exception = assertThrows(RuntimeException.class, () -> storeTypeFactory.getBuilder(StoreType.valueOf("invalidStore")));

        final String expected = "java.lang.IllegalArgumentException: No enum constant uk.gov.gchq.gaffer.gaas.model.StoreType.invalidStore";
        assertEquals(expected, exception.toString());
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }

    private List<StoreSpec> makeStoreList() {
        final List<StoreSpec> storeTypeManager = new ArrayList<>();
        MapStoreSpec mapStore = new MapStoreSpec();
        ProxyStoreSpec proxyStoreSpec = new ProxyStoreSpec();
        AccumuloStoreSpec accumuloStoreSpec = new AccumuloStoreSpec();
        FederatedStoreSpec federatedStoreType = new FederatedStoreSpec();
        storeTypeManager.add(federatedStoreType);
        storeTypeManager.add(accumuloStoreSpec);
        storeTypeManager.add(proxyStoreSpec);
        storeTypeManager.add(mapStore);

        return storeTypeManager;
    }

    private LinkedHashMap<String, Object> getStoreProperties() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("proxyHost", "http://my.graph.co.uk");
        return elementsSchema;
    }
}
