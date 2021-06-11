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
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraphConfigSpec;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
public class GaaSGraphConfigsLoaderTest {

    @Autowired
    private GaaSGraphConfigsLoader loader;

    @Test
    public void getConfig_shouldReturnConfigAsYamlTreeMap_whenFileNameExists() throws GaaSRestApiException {
        final Map<String, Object> accumuloConfig = loader.getConfig("/testconfigs", "accumulo");

        final Map<String, Object> expected = new HashMap<>();
        final Map<String, Object> enabled = new HashMap<>();
        enabled.put("enabled", true);
        expected.put("accumulo", enabled);
        assertEquals(expected, accumuloConfig);
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
        final List<GaaSGraphConfigSpec> specs = loader.listConfigSpecs("/testconfigs");

        final List<GaaSGraphConfigSpec> expected = Arrays.asList(
                new GaaSGraphConfigSpec("accumulo", new String[] {"schema"}),
                new GaaSGraphConfigSpec("federated", new String[] {"proxies"}),
                new GaaSGraphConfigSpec("mapStore", new String[] {"schema"}),
                new GaaSGraphConfigSpec("proxy", new String[] {"schema"}),
                new GaaSGraphConfigSpec("proxyNoContextRoot", new String[] {"schema"})
        );
        assertArrayEquals(expected.toArray(), specs.toArray());
    }

    @Test
    public void listConfigSpecs_shouldReturnSchemaConfigSpecsAsDefault_forAnyInvalidConfigSpecs() throws GaaSRestApiException {
        final List<GaaSGraphConfigSpec> specs = loader.listConfigSpecs("/invalidconfigs");

        final List<GaaSGraphConfigSpec> expected = Arrays.asList(
                new GaaSGraphConfigSpec("emptyStoreClassValue", new String[] {"schema"}),
                new GaaSGraphConfigSpec("invalidConfig", new String[] {"schema"}),
                new GaaSGraphConfigSpec("noGraphKey", new String[] {"schema"})
        );
        assertArrayEquals(expected.toArray(), specs.toArray());
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }
}
