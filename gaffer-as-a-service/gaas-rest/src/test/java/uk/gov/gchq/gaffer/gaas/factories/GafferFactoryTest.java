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

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.util.LinkedHashMap;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;

@UnitTest
public class GafferFactoryTest {

    private final Gson gson = new Gson();

    @Test
    public void emptyGafferSpec_shouldReturnGafferWithOverridesOnly() {
        final Gaffer gaffer = GafferFactory.from(new GafferSpec(), new GaaSCreateRequestBody("empty_config_id", "Empty graph config", getSchema(), "empty_config"));

        final String expected = "{" +
                "\"apiVersion\":\"gchq.gov.uk/v1\"," +
                "\"kind\":\"Gaffer\"," +
                "\"metadata\":{\"name\":\"empty_config_id\"}," +
                "\"spec\":{\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"config\":{\"description\":\"Empty graph config\",\"graphId\":\"empty_config_id\"}},\"ingress\":{\"host\":\"empty_config_id-kai-dev.apps.my.kubernetes.cluster\"}}" +
                "}";
        assertEquals(expected, gson.toJson(gaffer));
    }

    @Test
    public void proxyStoreRequest_shouldReturnProxyStoreRequestBody() {
        final GafferSpec proxyConfig = new GafferSpec();
        proxyConfig.putNestedObject("mygraph-kai-dev.apps.my.kubernetes.cluster", INGRESS_HOST_KEY);
        proxyConfig.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        proxyConfig.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
        proxyConfig.putNestedObject("http://my.graph.co.uk", "graph", "storeProperties", "gaffer.host");
        proxyConfig.putNestedObject("uk.gov.gchq.gaffer.proxystore.ProxyStore", "graph", "storeProperties", "gaffer.store.class");

        final Gaffer requestBody = GafferFactory.from(proxyConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "proxyNoContextRoot"));

        final String expected = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}},\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"storeProperties\":{\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void federatedStoreRequest_shouldReturnFederatedRequestBody() {
        final GafferSpec federatedConfig = new GafferSpec();
        federatedConfig.putNestedObject("mygraph-kai-dev.apps.my.kubernetes.cluster", INGRESS_HOST_KEY);
        federatedConfig.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        federatedConfig.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
        federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
        federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
        federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");

        final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federated"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}},\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void accumuloStoreRequestShouldReturnAccumuloRequestBody() {
        final GafferSpec accumuloConfig = new GafferSpec();
        accumuloConfig.putNestedObject(true, "accumulo", "enabled");
        accumuloConfig.putNestedObject("mygraph-kai-dev.apps.my.kubernetes.cluster", INGRESS_HOST_KEY);
        accumuloConfig.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        accumuloConfig.putNestedObject("/ui", INGRESS_UI_PATH_KEY);

        final Gaffer requestBody = GafferFactory.from(accumuloConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "accumulo"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"accumulo\":{\"enabled\":true},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}},\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void mapStoreStoreRequestShouldReturnMapStoreRequestBody() {
        final GafferSpec mapStoreConfig = new GafferSpec();
        mapStoreConfig.putNestedObject("mygraph-kai-dev.apps.my.kubernetes.cluster", INGRESS_HOST_KEY);
        mapStoreConfig.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        mapStoreConfig.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
        mapStoreConfig.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", "graph", "storeProperties", "gaffer.cache.service.class");
        mapStoreConfig.putNestedObject(true, "graph", "storeProperties", "gaffer.store.job.tracker.enabled");

        final Gaffer requestBody = GafferFactory.from(mapStoreConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "mapStore"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}},\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"storeProperties\":{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }
}
