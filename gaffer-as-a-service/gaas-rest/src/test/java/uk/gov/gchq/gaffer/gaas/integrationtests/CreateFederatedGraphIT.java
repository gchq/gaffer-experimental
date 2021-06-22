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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import uk.gov.gchq.gaffer.gaas.AbstractTest;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
public class CreateFederatedGraphIT extends AbstractTest {

    private static final String VALID_GRAPH_HOST = "testproxygraph-kai-dev.apps.ocp1.purplesky.cloud";
    private static final String VALID_ROOT = "/rest";

    @Autowired
    private ApiClient apiClient;

    @Test
    public void testAddGraphReturns201OnSuccess() throws Exception {
        final List<ProxySubGraph> subGraphs = Arrays.asList(new ProxySubGraph("bgraph", VALID_GRAPH_HOST, VALID_ROOT));
        final FederatedRequestBody federatedRequestBody = new FederatedRequestBody("igraph", TEST_GRAPH_DESCRIPTION, subGraphs, "federated");

        final MockHttpServletResponse response = mvc.perform(post("/graphs/federated")
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
        final FederatedRequestBody federatedRequestBody = new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, subGraphs, "federated");

        final MockHttpServletResponse result = mvc.perform(post("/graphs/federated")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(federatedRequestBody)))
                .andReturn()
                .getResponse();

        final String expected = "{\"title\":\"Bad Request\",\"detail\":\"Invalid Proxy Graph URL(s):" +
                " [TestGraph: Get Status request for 'TestGraph' failed. Reason: failed to resolve 'http' after 2 queries  at http://http/invalid.url/rest/graph/status]\"}";
        assertEquals(expected, result.getContentAsString());
        assertEquals(400, result.getStatus());
    }

    @Test
    void tearDown() {
        final CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        final String group = "gchq.gov.uk"; // String | the custom resource's group
        final String version = "v1"; // String | the custom resource's version
        final String plural = "gaffers"; // String | the custom resource's plural name. For TPRs this would be lowercase plural kind.
        final String name = TEST_GRAPH_ID; // String | the custom object's name
        try {
            apiInstance.deleteNamespacedCustomObject(group, version, namespace, plural, name, null, null, null, null, null);
        } catch (Exception e) {
            // Do nothing
        }
    }
}
