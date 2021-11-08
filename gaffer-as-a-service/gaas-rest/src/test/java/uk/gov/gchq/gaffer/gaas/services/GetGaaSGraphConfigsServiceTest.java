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

package uk.gov.gchq.gaffer.gaas.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GafferConfigSpec;
import uk.gov.gchq.gaffer.gaas.util.GafferSpecConfigsLoader;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import uk.gov.gchq.gaffer.mapstore.MapStore;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.Mockito.when;

@UnitTest
public class GetGaaSGraphConfigsServiceTest {

    @Autowired
    private GetGaaSGraphConfigsService service;

    @MockBean
    private GafferSpecConfigsLoader loader;

    @Test
    void whenGaasGraphConfigHasFederatedStore_returnGaasGraphConfigSpecWithProxiesParameter() throws GaaSRestApiException {
        final HashMap<String, GafferSpec> gafferSpecsMap = new HashMap<>();
        gafferSpecsMap.put("federated_config", getFederatedStoreGafferSpec());
        when(loader.listConfigSpecs("/config")).thenReturn(gafferSpecsMap);

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        final List<GafferConfigSpec> expected = Arrays.asList(new GafferConfigSpec("federated_config", new String[] {"proxies"}));
        assertArrayEquals(expected.toArray(), actual.toArray());
    }

    @Test
    void whenMultiConfigs_1FedAnd1MapStore_returnProxiesParamForFedAndSchemaParamForMap() throws GaaSRestApiException {
        final HashMap<String, GafferSpec> gafferSpecsMap = new HashMap<>();
        gafferSpecsMap.put("federated_config", getFederatedStoreGafferSpec());
        gafferSpecsMap.put("mapStore_config", getMapStoreGafferSpec());
        when(loader.listConfigSpecs("/config")).thenReturn(gafferSpecsMap);

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        final List<GafferConfigSpec> expected = Arrays.asList(
                new GafferConfigSpec("mapStore_config", new String[] {"schema"}),
                new GafferConfigSpec("federated_config", new String[] {"proxies"})
        );
        assertArrayEquals(expected.toArray(), actual.toArray());
    }

    @Test
    void whenNonFedStoreConfig_returnSchemaParam() throws GaaSRestApiException {
        final HashMap<String, GafferSpec> gafferSpecsMap = new HashMap<>();
        gafferSpecsMap.put("mapStore", getMapStoreGafferSpec());
        when(loader.listConfigSpecs("/config")).thenReturn(gafferSpecsMap);

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        final List<GafferConfigSpec> expected = Arrays.asList(
                new GafferConfigSpec("mapStore", new String[] {"schema"})
        );
        assertArrayEquals(expected.toArray(), actual.toArray());
    }

    @Test
    void whenNullConfig_returnSchemaParamByDefault() throws GaaSRestApiException {
        final HashMap<String, GafferSpec> gafferSpecsMap = new HashMap<>();
        gafferSpecsMap.put("empty_config_as_null", null);
        when(loader.listConfigSpecs("/config")).thenReturn(gafferSpecsMap);

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        final List<GafferConfigSpec> expected = Arrays.asList(
                new GafferConfigSpec("empty_config_as_null", new String[] {"schema"})
        );
        assertArrayEquals(expected.toArray(), actual.toArray());
    }

    @Test
    void whenEmptyConfig_returnSchemaParamByDefault() throws GaaSRestApiException {
        final HashMap<String, GafferSpec> gafferSpecsMap = new HashMap<>();
        gafferSpecsMap.put("empty_config", new GafferSpec());
        when(loader.listConfigSpecs("/config")).thenReturn(gafferSpecsMap);

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        final List<GafferConfigSpec> expected = Arrays.asList(
                new GafferConfigSpec("empty_config", new String[] {"schema"})
        );
        assertArrayEquals(expected.toArray(), actual.toArray());
    }

    @Test
    void whenStoreClassValueIsNull_returnSchemaParamByDefault() throws GaaSRestApiException {
        final HashMap<String, GafferSpec> gafferSpecsMap = new HashMap<>();
        gafferSpecsMap.put("nullStoreClass_config", getNullStoreClassValueGafferSpec());
        when(loader.listConfigSpecs("/config")).thenReturn(gafferSpecsMap);

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        final List<GafferConfigSpec> expected = Arrays.asList(
                new GafferConfigSpec("nullStoreClass_config", new String[] {"schema"})
        );
        assertArrayEquals(expected.toArray(), actual.toArray());
    }

    @Test
    void whenEmptyMapOfGafferSpecs_returnEmptyList() throws GaaSRestApiException {
        when(loader.listConfigSpecs("/config")).thenReturn(new HashMap<>());

        final List<GafferConfigSpec> actual = service.getGafferConfigSpecs();

        assertArrayEquals(new ArrayList().toArray(), actual.toArray());
    }

    private GafferSpec getFederatedStoreGafferSpec() {
        final GafferSpec federatedGafferSpec = new GafferSpec();
        federatedGafferSpec.putNestedObject(FederatedStore.class.getName(), "graph", "storeProperties", "gaffer.store.class");
        return federatedGafferSpec;
    }

    private GafferSpec getMapStoreGafferSpec() {
        final GafferSpec mapStoreGafferSpec = new GafferSpec();
        mapStoreGafferSpec.putNestedObject(MapStore.class.getName(), "graph", "storeProperties", "gaffer.store.class");
        return mapStoreGafferSpec;
    }

    private GafferSpec getNullStoreClassValueGafferSpec() {
        final GafferSpec mapStoreGafferSpec = new GafferSpec();
        mapStoreGafferSpec.putNestedObject(null, "graph", "storeProperties", "gaffer.store.class");
        return mapStoreGafferSpec;
    }
}
