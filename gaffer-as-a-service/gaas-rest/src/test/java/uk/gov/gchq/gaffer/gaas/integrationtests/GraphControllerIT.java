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

package uk.gov.gchq.gaffer.gaas.integrationtests;

import com.google.gson.Gson;
import io.kubernetes.client.openapi.ApiClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import uk.gov.gchq.gaffer.gaas.AbstractTest;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;

import java.util.LinkedHashMap;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
public class GraphControllerIT extends AbstractTest {
    private final String graphName = "testcontrolleritgraph";

    @Autowired
    private ApiClient apiClient;

    @Test
    public void authEndpointShouldReturn200StatusAndTokenWhenValidUsernameAndPassword() throws Exception {
        final String authRequest = "{\"username\":\"javainuse\",\"password\":\"password\"}";
        final MvcResult result = mvc.perform(post("/auth")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(authRequest)).andReturn();
        assertEquals(200, result.getResponse().getStatus());
        assertEquals(179, result.getResponse().getContentAsString().length());
    }

    @Test
    public void testAddGraph_WithSchema_Returns201OnSuccess() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(graphName, TEST_GRAPH_DESCRIPTION, getSchema(), "mapStore");
        final Gson gson = new Gson();
        final String inputJson = gson.toJson(gaaSCreateRequestBody);

        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        assertEquals(201, mvcResult.getResponse().getStatus());
    }

    @Test
    public void testAddGraphReturns201OnSuccess() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(graphName, TEST_GRAPH_DESCRIPTION, getSchema(), "mapStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        assertEquals(201, mvcResult.getResponse().getStatus());
    }

    @Test
    public void testAddGraphNotNullShouldReturn400() throws Exception {
        final String jsonRequest = "{\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"mapStore\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(jsonRequest)).andReturn();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph id should not be null\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, mvcResult.getResponse().getStatus());
    }

    @Test
    public void testAddGraphWithSameGraphIdShouldReturn409() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + graphName + "\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"mapStore\"}";
        mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        final MvcResult createGraphResponse = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        assertEquals("{\"title\":\"\",\"detail\":\"Kubernetes Cluster Error: (AlreadyExists) secrets \\\"testcontrolleritgraph\\\" already exists\"}", createGraphResponse.getResponse().getContentAsString());
        assertEquals(409, createGraphResponse.getResponse().getStatus());
    }

    @Test
    public void getGraphEndpointReturnsGraph() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + graphName + "\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"mapStore\"}";
        final MvcResult addGraphResponse = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        assertEquals(201, addGraphResponse.getResponse().getStatus());
        final MvcResult getGraphsResponse = mvc.perform(get("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        assertEquals(200, getGraphsResponse.getResponse().getStatus());
        assertTrue(getGraphsResponse.getResponse().getContentAsString().contains("testgraphid"));
    }

    @Test
    public void testGraphIdWithSpacesShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some graph \",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"mapStore\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void testGraphIdWithSpecialCharactersShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some!!!!graph@@\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"mapStore\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, mvcResult.getResponse().getStatus());
    }

    @Test
    public void testGraphIdWitCapitalLettersShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"SomeGraph\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"mapStore\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, mvcResult.getResponse().getStatus());
    }

    @Test
    public void testDescriptionEmptyShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + graphName + "\",\"description\":\"\",\"configName\":\"mapStore\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Description should not be empty\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, mvcResult.getResponse().getStatus());
    }

    @Test
    public void testDeleteShouldReturn200AndRemoveDeployment() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(graphName, TEST_GRAPH_DESCRIPTION, getSchema(), "mapStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        final MvcResult createGraphResponse = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        assertEquals(201, createGraphResponse.getResponse().getStatus());
        TimeUnit.SECONDS.sleep(60);
        final MvcResult getGraphsResponse = mvc.perform(delete("/graphs/" + graphName)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        assertEquals(204, getGraphsResponse.getResponse().getStatus());
    }

    @Test
    public void testDeleteShouldReturn404WhenGraphNotExisting() throws Exception {
        final MvcResult deleteGraphResponse = mvc.perform(delete("/graphs/nonexistentgraphfortestingpurposes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        assertEquals(404, deleteGraphResponse.getResponse().getStatus());
    }

    @Test
    public void namespacesEndpointShouldReturn200AndArrayWithNamespacesWhenNamespacesPresent() throws Exception {
        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        assertEquals(200, namespacesResponse.getResponse().getStatus());
        assertTrue(namespacesResponse.getResponse().getContentAsString().contains(namespace));
    }

    @Test
    public void testAddGraphFederatedStoreWithHook_WithSchema_Returns201OnSuccess() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(graphName, TEST_GRAPH_DESCRIPTION, null, "federated");
        final Gson gson = new Gson();
        final String inputJson = gson.toJson(gaaSCreateRequestBody);

        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        assertEquals(201, mvcResult.getResponse().getStatus());
    }


    @AfterEach
    void tearDown() throws InterruptedException {
        //This is necessary due to the fact that after each deployment OpenShift needs a few seconds to delete all the resources associated with the
        // graph which is created in the tests.
        TimeUnit.SECONDS.sleep(60);
        try {
            final MvcResult getGraphsResponse = mvc.perform(delete("/graphs/" + graphName)
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .header("Authorization", token))
                    .andReturn();
            //apiInstance.deleteNamespacedCustomObject(group, version, namespace, plural, name, null, null, null, null, null);
        } catch (Exception e) {
            // Do nothing
        }
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }
}
