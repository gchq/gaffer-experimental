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

@UnitTest
public class CreateCRDRequestBodyTest {

    private final Gson gson = new Gson();

    @Test
    public void federatedStoreRequest_shouldSerialiseToHaveFederatedStoreProperties_andNoAccumuloConfig() {
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(new GraphSpec.Builder()
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
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"" +
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
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(new GraphSpec.Builder()
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
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"" +
                        "graphId\":\"MyGraph\",\"library\":{},\"description\":\"My Graph deployed by the Controller\",\"hooks\":[]" +
                        "}" +
                        "},\"" +
                        "accumulo\":{\"" +
                        "enabled\":true" +
                        "}" +
                        "}" +
                        "}";

        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void mapStoreRequest_shouldCreateARequestWithMapStore() {
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");
        final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(new GraphSpec.Builder()
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
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"" +
                        "graphId\":\"MyGraph\",\"" +
                        "library\":{},\"" +
                        "description\":\"My Graph deployed by the Controller\",\"" +
                        "hooks\":[]" +
                        "}" +
                        "}" +
                        "}" +
                        "}";

        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    public void federatedStoreRequestWithAccumuloEnabled_shouldThrowIllegalArgumentException() {
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");
        try {
            final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                    .apiVersion("gchq.gov.uk/v1")
                    .kind("Gaffer")
                    .metaData(metadata)
                    .spec(new GraphSpec.Builder()
                            .enableAccumulo()
                            .graph(new NewGraph()
                                    .config(new GraphConfig.Builder()
                                            .graphId("MyGraph")
                                            .description("My Graph deployed by the Controller")
                                            .library(null)
                                            .build())
                                    .storeProperties(StoreType.FEDERATED_STORE))
                            .build());
        } catch (IllegalArgumentException e) {
            assertEquals("Cannot specify an accumulo graph with store properties", e.getMessage());
        }

    }


    @Test()
    public void mapStoreRequestWithAccumuloEnabled_shouldThrowIllegalArgumentException() {
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");
        try {
            final CreateCRDRequestBody requestBody = new CreateCRDRequestBody()
                    .apiVersion("gchq.gov.uk/v1")
                    .kind("Gaffer")
                    .metaData(metadata)
                    .spec(new GraphSpec.Builder()
                            .enableAccumulo()
                            .graph(new NewGraph()
                                    .config(new GraphConfig.Builder()
                                            .graphId("MyGraph")
                                            .description("My Graph deployed by the Controller")
                                            .library(null)
                                            .build())
                                    .storeProperties(StoreType.MAPSTORE))
                            .build());
        } catch (IllegalArgumentException e) {
            assertEquals("Cannot specify an accumulo graph with store properties", e.getMessage());
        }

    }
}
