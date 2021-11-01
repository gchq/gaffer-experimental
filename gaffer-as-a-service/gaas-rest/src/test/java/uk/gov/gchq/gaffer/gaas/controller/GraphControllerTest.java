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

package uk.gov.gchq.gaffer.gaas.controller;

import io.kubernetes.client.openapi.ApiClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.gaas.AbstractTest;
import uk.gov.gchq.gaffer.gaas.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.model.GafferConfigSpec;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.services.AuthService;
import uk.gov.gchq.gaffer.gaas.services.CreateFederatedStoreGraphService;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.gaas.services.DeleteGraphService;
import uk.gov.gchq.gaffer.gaas.services.GetGaaSGraphConfigsService;
import uk.gov.gchq.gaffer.gaas.services.GetGaffersService;
import uk.gov.gchq.gaffer.gaas.services.GetNamespacesService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
public class GraphControllerTest extends AbstractTest {

    @MockBean
    private ApiClient apiClient;
    @MockBean
    private GetGaffersService getGafferService;
    @MockBean
    private AuthService authService;
    @MockBean
    private CreateGraphService createGraphService;
    @MockBean
    private CreateFederatedStoreGraphService createFederatedStoreGraphService;
    @MockBean
    private DeleteGraphService deleteGraphService;
    @MockBean
    private GetNamespacesService getNamespacesService;
    @MockBean
    private GetGaaSGraphConfigsService getStoreTypesService;

    @Test
    public void getStoretypes_ReturnsStoretypesAsList_whenSuccessful() throws Exception {
        final List<GafferConfigSpec> specs = Arrays.asList(
                new GafferConfigSpec("accumulo", new String[] {"schema"}),
                new GafferConfigSpec("federated", new String[] {"proxies"}));
        when(getStoreTypesService.getGafferConfigSpecs()).thenReturn(specs);

        final MvcResult getStoretypeResponse = mvc.perform(get("/storetypes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals("{\"storeTypes\":[{\"name\":\"accumulo\",\"parameters\":[\"schema\"]},{\"name\":\"federated\",\"parameters\":[\"proxies\"]}]}", getStoretypeResponse.getResponse().getContentAsString());
    }

    @Test
    public void getGraphs_ReturnsGraphsAsList_whenSuccessful() throws Exception {
        final GaaSGraph graph = new GaaSGraph()
                .graphId(TEST_GRAPH_ID)
                .description(TEST_GRAPH_DESCRIPTION)
                .url("my-graph-namespace.apps.k8s.cluster")
                .configName("mapStore")
                .status(RestApiStatus.UP);
        final List<GaaSGraph> gaaSGraphs = new ArrayList<>();
        gaaSGraphs.add(graph);
        when(getGafferService.getAllGraphs()).thenReturn(gaaSGraphs);

        final MvcResult getGraphsResponse = mvc.perform(get("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        final String expected = "{\"graphs\":[{\"graphId\":\"testgraphid\",\"description\":\"Test Graph Description\",\"url\":\"my-graph-namespace.apps.k8s.cluster\",\"status\":\"UP\",\"problems\":null,\"configName\":\"mapStore\"}]}";
        assertEquals(expected, getGraphsResponse.getResponse().getContentAsString());
        assertEquals(200, getGraphsResponse.getResponse().getStatus());
    }

    @Test
    public void authEndpointShouldReturn200StatusAndTokenWhenValidUsernameAndPassword() throws Exception {
        final String authRequest = "{\"username\":\"javainuse\",\"password\":\"password\"}";
        when(authService.getToken(any(JwtRequest.class))).thenReturn("token received");

        final MvcResult result = mvc.perform(post("/auth")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(authRequest)).andReturn();

        assertEquals(200, result.getResponse().getStatus());
        assertEquals("token received", result.getResponse().getContentAsString());
    }

    @Test
    public void createGraph_whenSuccessful_shouldReturn201() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), "accumuloStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals(201, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_whenGraphIdIsNull_shouldReturn400() throws Exception {
        final String graphRequest = "{\"description\":\"password\",\"configName\":\"accumuloStore\"}";

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph id should not be null\"}", result.getResponse().getContentAsString());
        assertEquals(400, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_whenGraphIdHasSpaces_isInvalidAndShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some graph \",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"accumuloStore\"}";

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", result.getResponse().getContentAsString());
        assertEquals(400, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_whenGraphIdHasDashes_isValidAndShouldReturn201() throws Exception {
        final String graphRequest = "{\"graphId\":\"graph-with-dash\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"accumuloStore\"}";

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", result.getResponse().getContentAsString());
        assertEquals(400, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_graphIdWithSpecialCharacters_isInvalidAndShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some!!!!graph@@\",\"description\":\"a description\",\"configName\":\"accumuloStore\"}";

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", result.getResponse().getContentAsString());
        assertEquals(400, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_whenGraphIdHasCapitalLetters_shouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"SomeGraph\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"configName\":\"accumuloStore\"}";

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph ID can contain only digits or lowercase letters\"}", result.getResponse().getContentAsString());
        assertEquals(400, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_whenDescriptionIsEmptyOnly_return400() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + TEST_GRAPH_ID + "\",\"description\":\"\",\"configName\":\"accumuloStore\"}";

        final MvcResult response = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Description should not be empty\"}", response.getResponse().getContentAsString());
        assertEquals(400, response.getResponse().getStatus());
    }

    @Test
    public void deleteGraph_whenGraphExistsAndCanDelete_shouldReturn204() throws Exception {
        doNothing().when(deleteGraphService).deleteGraph(TEST_GRAPH_ID);

        final MvcResult result = mvc.perform(delete("/graphs/" + TEST_GRAPH_ID)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        verify(deleteGraphService, times(1)).deleteGraph(any(String.class));

        assertEquals(204, result.getResponse().getStatus());
    }

    @Test
    public void deleteGraph_whenGraphNDoesNotExist_return404() throws Exception {
        doThrow(new GaaSRestApiException("Graph not found", "NotFound", 404)).when(deleteGraphService).deleteGraph("nonexistentgraphfortestingpurposes");

        final MvcResult result = mvc.perform(delete("/graphs/nonexistentgraphfortestingpurposes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        verify(deleteGraphService, times(1)).deleteGraph("nonexistentgraphfortestingpurposes");
        assertEquals(404, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_hasSameGraphIdAsExistingOne_shouldReturn409() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), "accumuloStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doThrow(new GaaSRestApiException("This graph", "already exists", 409)).when(createGraphService).createGraph(any(GaaSCreateRequestBody.class));

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals(409, result.getResponse().getStatus());
        assertEquals("{\"title\":\"This graph\",\"detail\":\"already exists\"}", result.getResponse().getContentAsString());
    }

    @Test
    public void authEndpoint_shouldReturn401Status_whenValidUsernameAndPassword() throws Exception {
        final String authRequest = "{\"username\":\"invalidUser\",\"password\":\"abc123\"}";
        doThrow(new GaaSRestApiException("Invalid Credentials", "Username is incorrect", 401))
                .when(authService).getToken(any(JwtRequest.class));

        final MvcResult result = mvc.perform(post("/auth")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(authRequest)).andReturn();

        verify(authService, times(2)).getToken(any(JwtRequest.class));
        assertEquals(401, result.getResponse().getStatus());
        assertEquals("{\"title\":\"Invalid Credentials\",\"detail\":\"Username is incorrect\"}", result.getResponse().getContentAsString());
    }

    @Test
    public void namespaces_shouldReturnErrorMessageWhenNamespaceServiceException() throws Exception {
        doThrow(new GaaSRestApiException("Cluster not found", "NotFound", 404)).when(getNamespacesService).getNamespaces();

        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(404, namespacesResponse.getResponse().getStatus());
        assertEquals("{\"title\":\"Cluster not found\",\"detail\":\"NotFound\"}", namespacesResponse.getResponse().getContentAsString());
    }

    @Test
    public void namespaces_shouldReturn200AndArrayWithNamespacesWhenNamespacesPresent() throws Exception {
        when(getNamespacesService.getNamespaces()).thenReturn(Arrays.asList("dev-team-1", "dev-team-2", "test-team-5"));

        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(200, namespacesResponse.getResponse().getStatus());
        assertEquals("[\"dev-team-1\",\"dev-team-2\",\"test-team-5\"]", namespacesResponse.getResponse().getContentAsString());
    }

    @Test
    public void namespaces_shouldReturn200AndEmptyArrayWhenNoNamespacesExist() throws Exception {
        when(getNamespacesService.getNamespaces()).thenReturn(new ArrayList(0));

        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(200, namespacesResponse.getResponse().getStatus());
        assertEquals("[]", namespacesResponse.getResponse().getContentAsString());
    }

    @Test
    public void createGraph_shouldRequestAnAccumuloStoreAndReturn201() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), "accumuloStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals(201, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_shouldRequestAMapStoreAndReturn201() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), "mapStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals(201, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_shouldRequestAProxyStoreAndReturn201() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), "proxy");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals(201, result.getResponse().getStatus());
    }

    @Test
    public void createGraph_shouldReturn400BadRequestWhenStoreTypeIsNull() throws Exception {
        final String gaaSCreateRequestBody = "{" +
                "\"graphId\":\"invalidstoretype\"," +
                "\"description\":\"any\"" +
                "}";

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(gaaSCreateRequestBody)).andReturn();

        assertEquals(400, result.getResponse().getStatus());
        final String expected = "{\"title\":\"Validation failed\",\"detail\":\"\\\"configName\\\" must be defined. Valid config names can be found at /storetypes endpoint\"}";
        assertEquals(expected, result.getResponse().getContentAsString());
    }

    @Test
    public void createGraph_shouldReturn500BadRequestWhenStoreTypeIsInvalidType() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), "invalidStore");
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doThrow(new RuntimeException("configName is Invalid must be defined Valid Store Types supported are: federatedStore, accumuloStore, proxyStore and mapStore")).when(createGraphService).createGraph(any(GaaSCreateRequestBody.class));

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        assertEquals(500, result.getResponse().getStatus());
        final String expected = "{\"title\":\"RuntimeException\",\"detail\":\"configName is Invalid must be defined Valid Store Types supported are: federatedStore, accumuloStore, proxyStore and mapStore\"}";
        assertEquals(expected, result.getResponse().getContentAsString());
    }

    @Test
    public void exceptionHandler_catchRuntimeExceptionAndReturnGaaSApiErrorResponse() throws Exception {
        doThrow(new NullPointerException("Something was null")).when(deleteGraphService).deleteGraph("nullgraph");

        final MvcResult result = mvc.perform(delete("/graphs/nullgraph")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(500, result.getResponse().getStatus());
        assertEquals("{\"title\":\"NullPointerException\",\"detail\":\"Something was null\"}", result.getResponse().getContentAsString());
    }

    @Test
    public void createFedGraph_shouldReturnBadRequest_whenServiceThrows404GaasException() throws Exception {
        doThrow(new GaaSRestApiException("Not Found", "Config not found", 404))
                .when(createFederatedStoreGraphService).createFederatedStore(any(GaaSCreateRequestBody.class));
        final ProxySubGraph subGraph = new ProxySubGraph("proxygraph", "localhost:1234", "/rest");
        final GaaSCreateRequestBody request = new GaaSCreateRequestBody("fedgraph", "Some description", "federated", Collections.singletonList(subGraph));

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(request)))
                .andReturn();

        assertEquals(404, result.getResponse().getStatus());
        assertEquals("{\"title\":\"Not Found\",\"detail\":\"Config not found\"}", result.getResponse().getContentAsString());
    }

    @Test
    public void createFedGraph_shouldCallCreateFedStoreGraphService_whenRequestIsFedStore() throws Exception {
        final ProxySubGraph subGraph = new ProxySubGraph("proxygraph", "localhost:1234", "/rest");
        final GaaSCreateRequestBody request = new GaaSCreateRequestBody("fedgraph", "Some description", "federated", Collections.singletonList(subGraph));
        doNothing().when(createFederatedStoreGraphService).createFederatedStore(any(GaaSCreateRequestBody.class));

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(request)))
                .andReturn();

        assertEquals(201, result.getResponse().getStatus());
        verify(createFederatedStoreGraphService, times(1)).createFederatedStore(any(GaaSCreateRequestBody.class));
    }

    @Test
    public void createFedGraph_shouldCallCreateFedStoreGraphService_whenRequestHasProxiesAndSchema() throws Exception {
        final String request = "{" +
                "\"graphId\":\"graphid\"," +
                "\"description\":\"Schema and proxies\"," +
                "\"configName\":\"fedStoreConfig\"," +
                "\"proxySubGraphs\":[]," +
                "\"schema\":{\"types\":{}}" +
                "}";
        doNothing().when(createFederatedStoreGraphService).createFederatedStore(any(GaaSCreateRequestBody.class));

        final MvcResult result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(request))
                .andReturn();

        assertEquals(201, result.getResponse().getStatus());
        verify(createFederatedStoreGraphService, times(1)).createFederatedStore(any(GaaSCreateRequestBody.class));
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }
}
