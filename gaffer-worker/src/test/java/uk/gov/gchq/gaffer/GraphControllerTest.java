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
package uk.gov.gchq.gaffer;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.context.WebApplicationContext;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
@SpringBootTest
public class GraphControllerTest {
    protected MockMvc mvc;
    @Autowired
    WebApplicationContext webApplicationContext;
    protected String mapToJson(final Object obj) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(obj);
    }
    protected <T> T mapFromJson(final String json, final Class<T> clazz)
            throws JsonParseException, JsonMappingException, IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.readValue(json, clazz);
    }
    @BeforeEach
    public void setUp() {
        this.mvc = webAppContextSetup(webApplicationContext).build();
    }
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
    public void authEndpointShouldReturn401StatusWhenValidUsernameAndPassword() throws Exception {
        final String authRequest = "{\"username\":\"invalidUser\",\"password\":\"abc123\"}";
        final MvcResult result = mvc.perform(post("/auth")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(authRequest)).andReturn();
        assertEquals(401, result.getResponse().getStatus());
        assertEquals("Invalid Credentials", result.getResponse().getContentAsString());
    }
    /*
     * TODO:
     * - Happy path add graph
     * - Add graph with spaces in name
     * - Add graph with special characters
     * - Duplicate graph names added
     * - Capital letters / casing
     * - With/without description
     * */
    @Test
    public void testAddGraph() throws Exception {
        // Given - I have a auth token
        final String authRequest = "{\"username\":\"javainuse\",\"password\":\"password\"}";
        final MvcResult token = mvc.perform(post("/auth")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(authRequest)).andReturn();
        final Graph graph = new Graph("graphid2", "aDescription");
        final String inputJson = mapToJson(graph);
        final MvcResult mvcResult = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(inputJson)).andReturn();
        final int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
    }
    @Test
    public void getGraphsList() throws Exception {
        String uri = "/graphs";
        MvcResult mvcResult = mvc.perform(MockMvcRequestBuilders.get(uri)
                .accept(MediaType.APPLICATION_JSON_VALUE)).andReturn();
        int status = mvcResult.getResponse().getStatus();
        assertEquals(200, status);
        String content = mvcResult.getResponse().getContentAsString();
        Graph[] graphtlist = mapFromJson(content, Graph[].class);
        assertTrue(graphtlist.length > 0);
        assertEquals("OurGraph", graphtlist[0].getGraphId());
        assertEquals("YES", graphtlist[0].getDescription());
    }
}