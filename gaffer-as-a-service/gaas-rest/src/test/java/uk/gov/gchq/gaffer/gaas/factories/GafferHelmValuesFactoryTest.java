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
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.Yaml;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;

@UnitTest
public class GafferHelmValuesFactoryTest {

    private final Gson gson = new Gson();

    private LinkedHashMap<String, Object> getProxyHostStoreProperties() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("proxyHost", "http://my.graph.co.uk");
        return elementsSchema;
    }

    private LinkedHashMap<String, Object> getProxyHostAndRootStoreProperties() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("proxyHost", "http://my.graph.co.uk");
        elementsSchema.put("proxyContextRoot", "/rest");
        return elementsSchema;
    }

    @Test
    public void proxyStoreRequest_shouldReturnProxyStoreRequestBody_whenNoContextRootSpecified() {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "proxyStore", getProxyHostStoreProperties()));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void proxyStoreRequest_shouldReturnProxyStoreRequestBody() {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "proxyStore", getProxyHostAndRootStoreProperties()));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.context-root\":\"/rest\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void federatedStoreRequestShouldReturnFederatedRequestBody() {

        final Map<String, Object> federatedStoreProperties = new HashMap<>();
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "federated", getSchema(), getStorePropertiesFromYAMLResources("federated")));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void accumuloStoreRequestShouldReturnAccumuloRequestBody() {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "accumulo", getSchema(), getStorePropertiesFromYAMLResources("accumulo")));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"MyGraph\"}," +
                        "\"spec\":{" +
                        "\"accumulo\":{\"enabled\":true}," +
                        "\"graph\":{" +
                        "\"schema\":{" +
                        "\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}" +
                        "}," +
                        "\"config\":{" +
                        "\"description\":\"Another description\"," +
                        "\"graphId\":\"MyGraph\"" +
                        "}" +
                        "}," +
                        "\"ingress\":{" +
                        "\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\"," +
                        "\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void mapStoreStoreRequestShouldReturnMapStoreRequestBody() {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "mapStore", getSchema(), null));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"MyGraph\"}," +
                        "\"spec\":{" +
                        "\"graph\":{" +
                        "\"schema\":{" +
                        "\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"" +
                        "}," +
                        "\"storeProperties\":{" +
                        "\"gaffer.store.job.tracker.enabled\":true," +
                        "\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"" +
                        "}," +
                        "\"config\":{" +
                        "\"description\":\"Another description\"," +
                        "\"graphId\":\"MyGraph\"" +
                        "}" +
                        "}," +
                        "\"ingress\":{" +
                        "\"host\":\"mygraph-kai-dev." + INGRESS_SUFFIX + "\"," +
                        "\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void addSchema_shouldAddElementsJsonAndTypesJson() {
        final Gaffer requestBody = GafferHelmValuesFactory.from(new GaaSCreateRequestBody("MyGraph", "Another description", "mapStore", getSchema(), null));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"schema\":{\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"},\"storeProperties\":{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }


    private Map<String, Object> getStorePropertiesFromYAMLResources(final String file) {
        Yaml yaml = new Yaml();
        InputStream inputStream = this.getClass()
                .getClassLoader()
                .getResourceAsStream("yaml/" + file + ".yaml");


        Map<String, Object> storeProperties = yaml.load(inputStream);

        return storeProperties;
    }

    @Disabled
    public void testGetStorePropertiesFromYAMLResources() {
        Yaml yaml = new Yaml();
        InputStream inputStream = this.getClass()
                .getClassLoader()
                .getResourceAsStream("yaml/values-federated.yaml");


        Map<String, Object> storeProperties = yaml.load(inputStream);


        String expected =
                "{graph={storeProperties={gaffer.store.class=uk.gov.gchq.gaffer.federatedstore.FederatedStore, gaffer.store.properties.class=uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties, gaffer.serialiser.json.modules=uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules}}, ui={config={\n" +
                        "  \"gafferEndpoint\": {\n" +
                        "    \"path\": \"/rest\"\n" +
                        "  },\n" +
                        "  \"operationOptions\": {\n" +
                        "    \"visible\": [\n" +
                        "      {\n" +
                        "        \"key\": \"gaffer.federatedstore.operation.graphIds\",\n" +
                        "        \"label\": \"Graph Ids\",\n" +
                        "        \"multiple\": true,\n" +
                        "        \"autocomplete\": {\n" +
                        "          \"asyncOptions\": {\n" +
                        "            \"class\": \"GetAllGraphIds\"\n" +
                        "          }\n" +
                        "        }\n" +
                        "      },\n" +
                        "      {\n" +
                        "        \"key\": \"gaffer.federatedstore.operation.skipFailedFederatedStoreExecute\",\n" +
                        "        \"label\": \"Skip Failed Graphs\",\n" +
                        "        \"value\": \"false\",\n" +
                        "        \"autocomplete\": {\n" +
                        "          \"options\": [ \"true\", \"false\" ]\n" +
                        "        }\n" +
                        "      }\n" +
                        "    ]\n" +
                        "  }\n" +
                        "}}}";

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
