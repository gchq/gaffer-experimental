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
public class GaaSGraphConfigsLoaderTest {

    private static final String[] GAFFER_STORE_CLASS_NESTED_KEYS = {"graph", "storeProperties", "gaffer.store.class"};

    @Autowired
    private GaaSGraphConfigsLoader loader;

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

//    @Test
//    public void listConfigSpecs_shouldReturnProxiesConfigSpec_whenStorePropStoreClassIsFederatedStore() throws GaaSRestApiException {
//        final List<GaaSGraphConfigSpec> specs = loader.listConfigSpecs("/testconfigs");
//
//        final List<GaaSGraphConfigSpec> expected = Arrays.asList(
//                new GaaSGraphConfigSpec("accumulo", new String[] {"schema"}),
//                new GaaSGraphConfigSpec("federated", new String[] {"proxies"}),
//                new GaaSGraphConfigSpec("mapStore", new String[] {"schema"}),
//                new GaaSGraphConfigSpec("proxy", new String[] {"schema"}),
//                new GaaSGraphConfigSpec("proxyNoContextRoot", new String[] {"schema"})
//        );
//        assertArrayEquals(expected.toArray(), specs.toArray());
//    }

    @Test
    public void listConfigSpecs_shouldReturnSchemaConfigSpecsAsDefault_forAnyInvalidConfigSpecs() throws GaaSRestApiException {
        final Map<String, GafferSpec> specs = loader.listConfigSpecs("/invalidconfigs");

        final HashMap<String, GafferSpec> expected = new HashMap<>();

        final GafferSpec emptyStoreValueSpec = new GafferSpec();
        emptyStoreValueSpec.putNestedObject("", GAFFER_STORE_CLASS_NESTED_KEYS)
        expected.put("emptyStoreClassValue", emptyStoreValueSpec);


        expected.put("invalidConfig", new GafferSpec());


        expected.put("noGraphKey", new GafferSpec());
        assertEquals(expected, specs);
    }
}
