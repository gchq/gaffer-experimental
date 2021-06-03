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
import uk.gov.gchq.gaffer.gaas.stores.AbstractStoreTypeBuilder;
import uk.gov.gchq.gaffer.gaas.stores.AccumuloStoreType;
import uk.gov.gchq.gaffer.gaas.stores.FederatedStoreType;
import uk.gov.gchq.gaffer.gaas.stores.MapStoreType;
import uk.gov.gchq.gaffer.gaas.stores.ProxyStoreType;
import uk.gov.gchq.gaffer.gaas.stores.StoreType;
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
        final StoreTypeFactory storeTypeFactory = new StoreTypeFactory(getStoreTypes());
        final AbstractStoreTypeBuilder builder = storeTypeFactory.getBuilder("proxystore");

        final GafferSpec build = builder.setGraphId("mygraph").setDescription("Another description").setProperties(getStoreProperties()).build();

        final String expected =
                "{graph={storeProperties={gaffer.host=http://my.graph.co.uk, gaffer.store.class=uk.gov.gchq.gaffer.proxystore.ProxyStore}, config={description=Another description, graphId=mygraph, hooks=[{class=uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser, auths={}}]}}, ingress={host=mygraph-kai-dev.apps.my.kubernetes.cluster, pathPrefix={ui=/ui, api=/rest}}}";
        assertEquals(expected, build.toString());
    }

    @Test
    void testGetMapStoreBuilder() {
        final StoreTypeFactory storeTypeFactory = new StoreTypeFactory(getStoreTypes());
        final AbstractStoreTypeBuilder builder = storeTypeFactory.getBuilder("mapstore");

        final GafferSpec build = builder.setGraphId("mygraph").setDescription("Another description").setSchema(getSchema()).build();

        final String expected = "{graph={schema={schema.json={\"entities\":{},\"edges\":{},\"types\":{}}}, storeProperties={gaffer.store.job.tracker.enabled=true, gaffer.cache.service.class=uk.gov.gchq.gaffer.cache.impl.HashMapCacheService}, config={description=Another description, graphId=mygraph, hooks=[{class=uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser, auths={}}]}}, ingress={host=mygraph-kai-dev.apps.my.kubernetes.cluster, pathPrefix={ui=/ui, api=/rest}}}";
        assertEquals(expected, build.toString());
    }

    @Test
    void testGetInvalidStoreBuilder() {
        StoreTypeFactory storeTypeFactory = new StoreTypeFactory(getStoreTypes());
        final RuntimeException exception = assertThrows(RuntimeException.class, () -> storeTypeFactory.getBuilder("invalidStore"));

        final String expected = "java.lang.RuntimeException: StoreType is Invalid must be defined Valid Store Types supported are: federatedStore, accumuloStore, proxyStore, mapStore";

        assertEquals(expected, exception.toString());
    }

    private List<StoreType> getStoreTypes() {
        final List<StoreType> storeTypeManager = new ArrayList<>();

        storeTypeManager.add(new FederatedStoreType());
        storeTypeManager.add(new AccumuloStoreType());
        storeTypeManager.add(new ProxyStoreType());
        storeTypeManager.add(new MapStoreType());

        return storeTypeManager;
    }

    private LinkedHashMap<String, Object> getStoreProperties() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("proxyHost", "http://my.graph.co.uk");
        return elementsSchema;
    }

  @Test
  void testGetInvalidStoreBuilder() {
    List<StoreType> storeTypeManager = new ArrayList<>();

    setStoreList(storeTypeManager);
  StoreTypeFactory storeTypeFactory = new StoreTypeFactory(storeTypeManager);
    final RuntimeException exception = assertThrows(RuntimeException.class, () -> storeTypeFactory.getBuilder("invalidStore"));

    final String expected = "java.lang.RuntimeException: StoreType is Invalid must be defined Valid Store Types supported are: federatedStore, accumuloStore, proxyStore, mapStore";

    assertEquals(expected, exception.toString());
  }

  @Test
  void testGetStoreTypesAsStringList() {
    List<StoreType> storeTypeManager = new ArrayList<>();

    setStoreList(storeTypeManager);
    StoreTypeFactory storeTypeFactory = new StoreTypeFactory(storeTypeManager);

    final List<String> list = storeTypeFactory.getStoreTypesAsStringList();
    assertEquals("[federatedStore, accumuloStore, proxyStore, mapStore]", list.toString());
  }

  @Test
  void testGetStoreTypesWhenListEmpty() {
    List<StoreType> storeTypeManager = new ArrayList<>();

    StoreTypeFactory storeTypeFactory = new StoreTypeFactory(storeTypeManager);

    final List<String> list = storeTypeFactory.getStoreTypesAsStringList();
    assertEquals("[]", list.toString());
  }

  private LinkedHashMap<String, Object> getSchema() {
    final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
    elementsSchema.put("entities", new Object());
    elementsSchema.put("edges", new Object());
    elementsSchema.put("types", new Object());
    return elementsSchema;
  }
}
