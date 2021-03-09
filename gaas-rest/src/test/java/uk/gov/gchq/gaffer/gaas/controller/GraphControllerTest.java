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
    public void getGraphEndpointReturnsGraph() throws Exception {
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
    public void testAddGraphReturns201OnSuccess() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION);
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
    public void testAddGraphNotNullShouldReturn400() throws Exception {
        final String graphRequest = "{\"description\":\"password\"}";

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
    public void testGraphIdWithSpacesShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some graph \",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";

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
    public void testGraphIdWithDashShouldReturn201() throws Exception {
        final String graphRequest = "{\"graphId\":\"graph-with-dash\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";

        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void testGraphIdWithUnderscoreShouldReturn201() throws Exception {
        final String graphRequest = "{\"graphId\":\"graph_with_underscore\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";

        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(GaaSCreateRequestBody.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }

    @Test
    public void testGraphIdWithSpecialCharactersShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some!!!!graph@@\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";
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
    public void testGraphIdWitCapitalLettersShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"SomeGraph\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";
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
    public void testDescriptionEmptyShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + TEST_GRAPH_ID + "\",\"description\":\"\"}";
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
    public void testDeleteShouldReturn200AndRemoveCRD() throws Exception {
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
    public void testDeleteShouldReturn404WhenGraphNotExisting() throws Exception {
        doThrow(new GaaSRestApiException("Graph not found", "NotFound", 404)).when(deleteGraphService).deleteGraph("nonexistentgraphfortestingpurposes");

        final MvcResult mvcResult2 = mvc.perform(delete("/graphs/nonexistentgraphfortestingpurposes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        verify(deleteGraphService, times(1)).deleteGraph("nonexistentgraphfortestingpurposes");
        assertEquals(404, mvcResult2.getResponse().getStatus());

    }

    @Test
    public void testAddGraphWithSameGraphIdShouldReturn409() throws Exception {
        final GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION);
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
    public void namespacesEndpointShouldReturnErrorMessageWhenNamespaceServiceException() throws Exception {
        doThrow(new GaaSRestApiException("Cluster not found", "NotFound", 404)).when(getNamespacesService).getNamespaces();

        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(404, namespacesResponse.getResponse().getStatus());
        assertEquals("{\"title\":\"Cluster not found\",\"detail\":\"NotFound\"}", namespacesResponse.getResponse().getContentAsString());
    }

    @Test
    public void namespacesEndpointShouldReturn200AndArrayWithNamespacesWhenNamespacesPresent() throws Exception {
        when(getNamespacesService.getNamespaces()).thenReturn(Arrays.asList("dev-team-1", "dev-team-2", "test-team-5"));

        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(200, namespacesResponse.getResponse().getStatus());
        assertEquals("[\"dev-team-1\",\"dev-team-2\",\"test-team-5\"]", namespacesResponse.getResponse().getContentAsString());
    }

    @Test
    public void namespacesEndpointShouldReturn200AndEmptyArrayWhenNoNamespacesExist() throws Exception {
        when(getNamespacesService.getNamespaces()).thenReturn(new ArrayList(0));

        final MvcResult namespacesResponse = mvc.perform(get("/namespaces")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        assertEquals(200, namespacesResponse.getResponse().getStatus());
        assertEquals("[]", namespacesResponse.getResponse().getContentAsString());
    }
}
