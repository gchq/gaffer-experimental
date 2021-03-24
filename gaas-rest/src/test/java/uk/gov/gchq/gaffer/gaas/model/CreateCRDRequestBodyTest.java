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

package uk.gov.gchq.gaffer.gaas.model;

import com.google.gson.Gson;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
public class CreateCRDRequestBodyTest {

    private final Gson gson = new Gson();
    private final V1ObjectMeta v1ObjectMeta = new V1ObjectMeta().name("my-gaffer");

    @Test
    public void proxyStoreRequest_shouldCreateProxyStoreRequest_whenNoContextRoot() {
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My proxy store graph")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.PROXY_STORE, "http://host.only.co.uk", null))
                        .build());

        final String expected = "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                "\"kind\":\"Gaffer\"," +
                "\"metadata\":{\"name\":\"my-gaffer\"}," +
                "\"spec\":{" +
                "\"graph\":{" +
                "\"config\":{" +
                "\"graphId\":\"MyGraph\"," +
                "\"library\":{}," +
                "\"description\":\"My proxy store graph\"," +
                "\"hooks\":[]" +
                "}," +
                "\"storeProperties\":{\"" +
                "gaffer.host\":\"http://host.only.co.uk\",\"" +
                "gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"" +
                "}" +
                "}" +
                "}" +
                "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void proxyStoreRequest_shouldThrowIAX_whenProxyStoreTypeAndNullHost() {
        final Exception exception = assertThrows(IllegalArgumentException.class, () -> new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My proxy store graph")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.PROXY_STORE))
                        .build()));

        assertEquals("Host is required to create a proxy store to proxy", exception.getMessage());
    }

    @Test
    public void proxyStoreRequest_shouldSerialiseToHaveProxyStorePropertiesAndHostAndRoot_andNoAccumuloConfig() {
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My proxy store graph")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.PROXY_STORE, "http://graph.request.co.uk", "/v1/rest"))
                        .build());

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"my-gaffer\"}," +
                        "\"spec\":{" +
                        "\"graph\":{" +
                        "\"config\":{" +
                        "\"graphId\":\"MyGraph\"," +
                        "\"library\":{}," +
                        "\"description\":\"My proxy store graph\"," +
                        "\"hooks\":[]" +
                        "}," +
                        "\"storeProperties\":{\"" +
                        "gaffer.host\":\"http://graph.request.co.uk\",\"" +
                        "gaffer.context-root\":\"/v1/rest\",\"" +
                        "gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"" +
                        "}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void federatedStoreRequest_shouldSerialiseToHaveFederatedStoreProperties_andNoAccumuloConfig() {
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My Graph deployed by the Controller")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.FEDERATED_STORE))
                        .build());

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"my-gaffer\"}," +
                        "\"spec\":{" +
                        "\"graph\":{" +
                        "\"config\":{\"" +
                        "graphId\":\"MyGraph\",\"" +
                        "library\":{},\"" +
                        "description\":\"My Graph deployed by the Controller\",\"" +
                        "hooks\":[]" +
                        "}," +
                        "\"storeProperties\":{\"" +
                        "gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"" +
                        "gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"" +
                        "gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"" +
                        "}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void accumuloStoreRequest_shouldSerialiseToHaveDefaultAccumuloStoreProperties_andAccumuloEnabled() {
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .enableAccumulo()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My Graph deployed by the Controller")
                                        .library(null)
                                        .build()))
                        .build());

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"my-gaffer\"}," +
                        "\"spec\":{" +
                        "\"graph\":{" +
                        "\"config\":{" +
                        "\"graphId\":\"MyGraph\",\"library\":{},\"description\":\"My Graph deployed by the Controller\",\"hooks\":[]" +
                        "}" +
                        "}," +
                        "\"accumulo\":{" +
                        "\"enabled\":true" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void mapStoreRequest_shouldCreateARequestWithMapStore() {
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My Graph deployed by the Controller")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.MAPSTORE))
                        .build());

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"my-gaffer\"}," +
                        "\"spec\":{" +
                        "\"graph\":{" +
                        "\"config\":{\"" +
                        "graphId\":\"MyGraph\"," +
                        "\"library\":{}," +
                        "\"description\":\"My Graph deployed by the Controller\"," +
                        "\"hooks\":[]" +
                        "}," +
                        "\"storeProperties\":{" +
                        "\"gaffer.store.job.tracker.enabled\":true," +
                        "\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"" +
                        "}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void federatedStoreRequestWithAccumuloEnabled_shouldThrowIllegalArgumentException() {
        final Exception e = assertThrows(IllegalArgumentException.class, () -> new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .enableAccumulo()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My Graph deployed by the Controller")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.FEDERATED_STORE))
                        .build()));
        assertEquals("Cannot specify an accumulo graph with store properties", e.getMessage());
    }

    @Test()
    public void mapStoreRequestWithAccumuloEnabled_shouldThrowIllegalArgumentException() {
        final Exception e = assertThrows(IllegalArgumentException.class, () -> new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(v1ObjectMeta)
                .spec(new GafferHelmChartValues.Builder()
                        .enableAccumulo()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My Graph deployed by the Controller")
                                        .library(null)
                                        .build())
                                .storeProperties(StoreType.MAPSTORE))
                        .build()));
        assertEquals("Cannot specify an accumulo graph with store properties", e.getMessage());
    }
}
