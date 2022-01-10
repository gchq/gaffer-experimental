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

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import uk.gov.gchq.gaffer.gaas.AbstractTest;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
public class CreateFederatedGraphIT extends AbstractTest {

    private static final String VALID_ROOT = "/rest";
    private static final String GRAPH_ID = "TEST_GRAPH_ID";

    @Autowired
    private ApiClient apiClient;
    @Autowired
    private CreateGraphService createGraphService;

    @Test
    public void testAddGraphReturns201OnSuccess() throws Exception {
        final List<ProxySubGraph> subGraphs = Arrays.asList(new ProxySubGraph(proxyGraphId, proxyGraphHost, VALID_ROOT));
        final GaaSCreateRequestBody federatedRequestBody = new GaaSCreateRequestBody(GRAPH_ID, TEST_GRAPH_DESCRIPTION, "federated", subGraphs);

        final MockHttpServletResponse response = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(federatedRequestBody)))
                .andReturn()
                .getResponse();

        assertEquals("", response.getContentAsString());
        assertEquals(201, response.getStatus());
    }

    @Test
    public void whenSubGraphURLIsInvalid_shouldReturnBadRequest() throws Exception {
        final List<ProxySubGraph> subGraphs = Arrays.asList(new ProxySubGraph("TestGraph", "http://invalid.url", "/rest"));
        final GaaSCreateRequestBody federatedRequestBody = new GaaSCreateRequestBody(GRAPH_ID, TEST_GRAPH_DESCRIPTION, "federated", subGraphs);

        final MockHttpServletResponse result = mvc.perform(post("/graphs")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(federatedRequestBody)))
                .andReturn()
                .getResponse();

        final String expected = "{\"title\":\"Bad Request\",\"detail\":\"Invalid Proxy Graph URL(s):" +
                " [TestGraph: Get Status request for 'TestGraph' failed. Reason: failed to resolve 'http' after 4 queries  at http://http/invalid.url/rest/graph/status]\"}";
        assertEquals(expected, result.getContentAsString());
        assertEquals(400, result.getStatus());
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());

        final LinkedHashMap<String, Object> types = new LinkedHashMap<>();
        types.put("types", new Object());
        elementsSchema.put("types", types);
        return elementsSchema;
    }

    @AfterEach
    void tearDown() {
        final CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        final String group = "gchq.gov.uk"; // String | the custom resource's group
        final String version = "v1"; // String | the custom resource's version
        final String plural = "gaffers"; // String | the custom resource's plural name. For TPRs this would be lowercase plural kind.
        try {
            apiInstance.deleteNamespacedCustomObject(group, version, namespace, plural, GRAPH_ID, null, null, null, null, null);
        } catch (Exception e) {
            // Do nothing
        }
    }
}
