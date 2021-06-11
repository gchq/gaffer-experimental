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
import org.yaml.snakeyaml.Yaml;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class GafferHelmValuesFactoryTest {

    private final Gson gson = new Gson();

    @Test
    public void requestOverrides____() throws GaaSRestApiException {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("override-graph-id", "Override description", "accumulo", getSchema()));

        final String expected = "{" +
                "\"apiVersion\":\"gchq.gov.uk/v1\"," +
                "\"kind\":\"Gaffer\"," +
                "\"metadata\":{\"name\":\"override-graph-id\"}," +
                "\"spec\":{" +
                "\"graph\":{" +
                "\"storeProperties\":{\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\",\"gaffer.host\":\"http://my.graph.co.uk\"}," +
                "\"config\":{\"description\":\"Override description\",\"graphId\":\"override-graph-id\"," +
                "\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]}," +
                "\"schema\":{}" +
                "}," +
                "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}" +
                "}";
        assertEquals(expected, gson.toJson(requestBody));
    }


    @Test
    public void proxyStoreRequest_shouldReturnProxyStoreRequestBody_whenNoContextRootSpecified() throws GaaSRestApiException {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "proxyNoContextRoot", getSchema()));

        final String expected = "{" +
                "\"apiVersion\":\"gchq.gov.uk/v1\"," +
                "\"kind\":\"Gaffer\"," +
                "\"metadata\":{\"name\":\"MyGraph\"}," +
                "\"spec\":{" +
                "\"graph\":{" +
                "\"storeProperties\":{\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\",\"gaffer.host\":\"http://my.graph.co.uk\"}," +
                "\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"," +
                "\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]}," +
                "\"schema\":{}" +
                "}," +
                "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}" +
                "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void proxyStoreRequest_shouldReturnProxyStoreRequestBody() throws GaaSRestApiException {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "proxy", getSchema()));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\",\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.context-root\":\"/rest\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"schema\":{}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void federatedStoreRequestShouldReturnFederatedRequestBody() {
//        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "federated", getProxyGraphs()));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"schema\":{}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
//        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void accumuloStoreRequestShouldReturnAccumuloRequestBody() throws GaaSRestApiException {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "accumulo", getSchema()));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"accumulo\":{\"enabled\":true},\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void mapStoreStoreRequestShouldReturnMapStoreRequestBody() throws GaaSRestApiException {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "mapStore", getSchema()));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void addSchema_shouldAddElementsJsonAndTypesJson() {
//        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "mapStore", getSchema(), getStorePropertiesFromYAMLResources("mapStore")));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
//        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void testGetStorePropertiesFromYAMLResources() {
        Yaml yaml = new Yaml();
        InputStream inputStream = this.getClass()
                .getClassLoader()
                .getResourceAsStream("config/federated.yaml");
        Map<String, Object> storeProperties = yaml.load(inputStream);
        String expected = "{graph={storeProperties={gaffer.store.class=uk.gov.gchq.gaffer.federatedstore.FederatedStore, gaffer.store.properties.class=uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties, gaffer.serialiser.json.modules=uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules}}}";
        assertEquals(expected, storeProperties.toString());
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }
}
