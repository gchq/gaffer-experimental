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
package uk.gov.gchq.gaffer.controller;

import com.google.gson.Gson;
import io.kubernetes.client.openapi.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import uk.gov.gchq.gaffer.AbstractTest;
import uk.gov.gchq.gaffer.Exception.GafferWorkerApiException;
import uk.gov.gchq.gaffer.auth.JwtRequest;
import uk.gov.gchq.gaffer.model.Graph;
import uk.gov.gchq.gaffer.services.AuthService;
import uk.gov.gchq.gaffer.services.CreateGraphService;
import uk.gov.gchq.gaffer.services.DeleteGraphService;
import uk.gov.gchq.gaffer.services.GetGafferService;
import java.util.ArrayList;
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
    private GetGafferService getGafferService;

    @MockBean
    private AuthService authService;

    @MockBean
    private CreateGraphService createGraphService;

    @MockBean
    private DeleteGraphService deleteGraphService;


    @Test
    public void getGraphEndpointReturnsGraph() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + TEST_GRAPH_ID + "\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";
        Gson g = new Gson();
        Graph graph = g.fromJson(graphRequest, Graph.class);
        ArrayList<Graph> graphList = new ArrayList<>();
        graphList.add(graph);
        when(getGafferService.getGraphs()).thenReturn(graphList);
        final MvcResult getGraphsResponse = mvc.perform(get("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();
        assertEquals("[{\"graphId\":\"testgraphid\",\"description\":\"Test Graph Description\"}]", getGraphsResponse.getResponse().getContentAsString());
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
        final Graph graph = new Graph(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION);
        final String inputJson = mapToJson(graph);

        doNothing().when(createGraphService).createGraph(graph);

        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        verify(createGraphService, times(1)).createGraph(any(Graph.class));

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

        verify(createGraphService, times(0)).createGraph(any(Graph.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"message\":\"Validation failed\",\"details\":\"Graph id should not be null\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void testGraphIdWithSpacesShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some graph \",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();

        verify(createGraphService, times(0)).createGraph(any(Graph.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"message\":\"Validation failed\",\"details\":\"Graph can contain only digits,lowercase letters or _ \"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }


    @Test
    public void testGraphIdWithSpecialCharactersShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"some!!!!graph@@\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();
        verify(createGraphService, times(0)).createGraph(any(Graph.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"message\":\"Validation failed\",\"details\":\"Graph can contain only digits,lowercase letters or _ \"}", mvcResult.getResponse().getContentAsString());
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
        verify(createGraphService, times(0)).createGraph(any(Graph.class));
        assertEquals("{\"message\":\"Validation failed\",\"details\":\"Graph can contain only digits,lowercase letters or _ \"}", mvcResult.getResponse().getContentAsString());
        assertEquals(400, status);
    }

    @Test
    public void testDescriptionEmptyShouldReturn400() throws Exception {
        final String graphRequest = "{\"graphId\":\"" + TEST_GRAPH_ID + "\",\"description\":\"\"}";
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(graphRequest)).andReturn();


        verify(createGraphService, times(0)).createGraph(any(Graph.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"message\":\"Validation failed\",\"details\":\"Description should not be empty\"}", mvcResult.getResponse().getContentAsString());
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

        doThrow(new ApiException(404, "Graph not found")).when(deleteGraphService).deleteGraph("nonexistentgraphfortestingpurposes");
        //when delete graph
        final MvcResult mvcResult2 = mvc.perform(delete("/graphs/nonexistentgraphfortestingpurposes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token))
                .andReturn();

        verify(deleteGraphService, times(1)).deleteGraph("nonexistentgraphfortestingpurposes");
        //then have no graphs / 200 return
        assertEquals(404, mvcResult2.getResponse().getStatus());

    }

    @Test
    public void testAddGraphWithSameGraphIdShouldReturn409() throws Exception {
        final Graph graph = new Graph(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION);
        final String inputJson = mapToJson(graph);
        doThrow(new GafferWorkerApiException("This graph", "already exists", 409)).when(createGraphService).createGraph(any(Graph.class));
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();

        verify(createGraphService, times(1)).createGraph(any(Graph.class));
        final int status = mvcResult.getResponse().getStatus();
        assertEquals("{\"message\":\"This graph\",\"details\":\"already exists\"}", mvcResult.getResponse().getContentAsString());
        assertEquals(409, status);
    }

//    @Test
//    public void authEndpointShouldReturn401StatusWhenValidUsernameAndPassword() throws Exception {
//        final String authRequest = "{\"username\":\"invalidUser\",\"password\":\"abc123\"}";
//
//        doThrow(new BadCredentialsException("Invalid Credentials")).when(authService).getToken(any(JwtRequest.class));
//        final MvcResult result = mvc.perform(post("/auth")
//                .contentType(MediaType.APPLICATION_JSON_VALUE)
//                .content(authRequest)).andReturn();
//
//        verify(authService, times(2)).getToken(any(JwtRequest.class));
//        //assertEquals(401, result.getResponse().getStatus());
//        assertEquals("Invalid Credentials", result.getResponse().getContentAsString());
//    }


}
