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
import org.springframework.test.web.servlet.MvcResult;
import uk.gov.gchq.gaffer.gaas.AbstractTest;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
public class CreateFederatedGraphIT extends AbstractTest {
    @Autowired
    private ApiClient apiClient;

    private static final String VALID_GRAPH_HOST = "testproxygraph-kai-dev.apps.ocp1.purplesky.cloud";

    @Test
    public void testAddGraphReturns201OnSuccess() throws Exception {
        final List<ProxySubGraph> subGraphs = Arrays.asList(new ProxySubGraph("testproxy", VALID_GRAPH_HOST, "/rest"));
        final FederatedRequestBody federatedRequestBody = new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, subGraphs);

        final MvcResult mvcResult = mvc.perform(post("/graphs/federated")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(federatedRequestBody))).andReturn();

        assertEquals("", mvcResult.getResponse().getStatus() + " " + mvcResult.getResponse().getContentAsString());
    }

    @Test
    public void whenSubGraphURLIsInvalid_shouldReturnBadRequest() throws Exception {
        final List<ProxySubGraph> subGraphs = Arrays.asList(new ProxySubGraph("TestGraph", "http://invalid", "/rest"));
        final FederatedRequestBody federatedRequestBody = new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, subGraphs);

        final MvcResult mvcResult = mvc.perform(post("/graphs/federated")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", token)
                .content(mapToJson(federatedRequestBody))).andReturn();

        assertEquals(400, mvcResult.getResponse().getStatus());
        assertEquals("{\"title\":\"Bad Request\",\"detail\":\"Invalid Proxy Graph URL(s): [TestGraph: TestGraph has invalid host. Reason: failed to resolve 'http' after 4 queries  at http://invalid/rest]\"}", mvcResult.getResponse().getContentAsString());
    }

    @AfterEach
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
