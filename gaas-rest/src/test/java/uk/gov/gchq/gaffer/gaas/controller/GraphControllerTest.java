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
import uk.gov.gchq.gaffer.gaas.AbstractTest;
import uk.gov.gchq.gaffer.gaas.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import uk.gov.gchq.gaffer.gaas.services.AuthService;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.gaas.services.DeleteGraphService;
import uk.gov.gchq.gaffer.gaas.services.GetGafferService;
import uk.gov.gchq.gaffer.gaas.services.GetNamespacesService;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import uk.gov.gchq.gaffer.store.library.FileGraphLibrary;
import java.util.ArrayList;
import java.util.Arrays;
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
    private GetGafferService getGafferService;
    @MockBean
    private AuthService authService;
    @MockBean
    private CreateGraphService createGraphService;
    @MockBean
    private DeleteGraphService deleteGraphService;
    @MockBean
    private GetNamespacesService getNamespacesService;

    @Test
    public void getGraphs_ReturnsGraphsAsList_whenSuccessful() throws Exception {
        final GraphConfig graph = new GraphConfig.Builder()
                .graphId(TEST_GRAPH_ID)
                .description(TEST_GRAPH_DESCRIPTION)
                .library(new FileGraphLibrary())
                .build();
        ArrayList<GraphConfig> graphList = new ArrayList<>();
        graphList.add(graph);
        when(getGafferService.getAllGraphs()).thenReturn(graphList);
        final MvcResult getGraphsResponse = mvc.perform(get("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        final String expected = "[{\"description\":\"Test Graph Description\",\"graphId\":\"testgraphid\",\"hooks\":[]," +
                "\"library\":{\"class\":\"uk.gov.gchq.gaffer.store.library.FileGraphLibrary\",\"path\":\"graphLibrary\"},\"view\":null}]";
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
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, StoreType.ACCUMULO);
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void createGraph_whenGraphIdIsNull_shouldReturn400() throws Exception {
        final String graphRequest = "{\"description\":\"password\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph id should not be null\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void createGraph_whenGraphIdHasSpaces_isInvalidAndShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some graph \",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph can contain only digits, lowercase letters or the special characters _ and -\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void createGraph_whenGraphIdHasDashes_isValidAndShouldReturn201() throws Exception {
        final String graphRequest = "{\"graphId\":\"graph-with-dash\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void createGraph_whenGraphIdHasUnderscore_isValidAndShouldReturn201() throws Exception {
        final String graphRequest = "{\"graphId\":\"graph_with_underscore\",\"description\":\"a description\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void createGraph_graphIdWithSpecialCharacters_isInvalidAndShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some!!!!graph@@\",\"description\":\"a description\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph can contain only digits, lowercase letters or the special characters _ and -\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void createGraph_whenGraphIdHasCapitalLetters_shouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"SomeGraph\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        final int status = mvcResult.getResponse().getStatus();
        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Graph can contain only digits, lowercase letters or the special characters _ and -\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void createGraph_whenDescriptionIsEmptyOnly_return400() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + TEST_GRAPH_ID + "\",\"description\":\"\",\"storeType\":\"ACCUMULO\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(0)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"title\":\"Validation failed\",\"detail\":\"Description should not be empty\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void deleteGraph_whenGraphExistsAndCanDelete_shouldReturn204() throws Exception {
        doNothing().when(deleteGraphService).deleteGraph(TEST_GRAPH_ID);
        //when delete graph
        final MvcResult mvcResult2 = mvc.perform(delete("/graphs/" + TEST_GRAPH_ID)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        verify(deleteGraphService, times(1)).deleteGraph(any(String.class));
        //then have no graphs / 200 return
        assertEquals(204, mvcResult2.getResponse().getStatus());
    }

    @Test
    public void deleteGraph_whenGraphNDoesNotExist_return404() throws Exception {
        doThrow(new GaaSRestApiException("Graph not found", "NotFound", 404)).when(deleteGraphService).deleteGraph("nonexistentgraphfortestingpurposes");
        final MvcResult mvcResult2 = mvc.perform(delete("/graphs/nonexistentgraphfortestingpurposes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        verify(deleteGraphService, times(1)).deleteGraph("nonexistentgraphfortestingpurposes");
        assertEquals(404, mvcResult2.getResponse().getStatus());
    }

    @Test
    public void createGraph_hasSameGraphIdAsExistingOne_shouldReturn409() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, StoreType.ACCUMULO);
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doThrow(new GaaSRestApiException("This graph", "already exists", 409)).when(createGraphService).createGraph(any(GaaSCreateRequestBody.class));
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        assertEquals(409, mvcResult.getResponse().getStatus());
        assertEquals("{\"title\":\"This graph\",\"detail\":\"already exists\"}", mvcResult.getResponse().getContentAsString());
    }

    @Test
    public void authEndpointShouldReturn401StatusWhenValidUsernameAndPassword() throws Exception {
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
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, StoreType.ACCUMULO);
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void createGraph_shouldRequestAMapStoreAndReturn201() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, StoreType.MAPSTORE);
        final String inputJson = mapToJson(gaaSCreateRequestBody);
        doNothing().when(createGraphService).createGraph(gaaSCreateRequestBody);
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void createGraph_shouldReturn400BadRequestWhenStoreTypeIsNull() throws Exception {
        final String gaaSCreateRequestBody = "{" +
                "\"graphId\":\"invalid-store-type\"," +
                "\"description\":\"any\"" +
                "}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(gaaSCreateRequestBody)).andReturn();
        assertEquals(400, mvcResult.getResponse().getStatus());
        final String expected = "{\"title\":\"Validation failed\",\"detail\":\"\\\"storeType\\\" must be defined. " +
                "Valid Store Types supported are MAPSTORE, ACCUMULO and FEDERATED_STORE\"}";
        assertEquals(expected, mvcResult.getResponse().getContentAsString());
    }

    @Test
    public void createGraph_shouldReturn400BadRequestWhenStoreTypeIsInvalidType() throws Exception {
        final String gaaSCreateRequestBody = "{" +
                "\"graphId\":\"invalid-store-type\"," +
                "\"description\":\"any\"," +
                "\"storeType\":\"INVALID\"" +
                "}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(gaaSCreateRequestBody)).andReturn();
        assertEquals(400, mvcResult.getResponse().getStatus());
        final String expected = "{\"title\":\"InvalidFormatException\",\"detail\":\"Cannot deserialize value of type " +
                "`uk.gov.gchq.gaffer.gaas.model.StoreType` from String \\\"INVALID\\\": not one of the values accepted " +
                "for Enum class: [MAPSTORE, FEDERATED_STORE, ACCUMULO]\\n at [Source: (PushbackInputStream); line: 1, column: 65] " +
                "(through reference chain: uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody[\\\"storeType\\\"])\"}";
        assertEquals(expected, mvcResult.getResponse().getContentAsString());
    }
}
