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

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class CRDClientIT {

    @Autowired
    CRDClient crdClient;
    @Autowired
    private ApiClient apiClient;
    @Value("${namespace}")
    private String namespace;
    @Value("${group}")
    private String group;
    private static final String TEST_GRAPH_ID = "testgraphid";
    private static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";

    @Test
    public void createCRD_whenNullRequestObject() {
        assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(null));
    }

    @Test
    public void createCRD_whenCreateRequestBodyIsInvalid_throwsBadRequestApiException() {
        final String requestBody = "{\"invalid\":\"request body\"}";

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(requestBody));

        assertEquals("BadRequest", exception.getBody());
        final String expected = "the object provided is unrecognized (must be of type Gaffer): couldn't get version/kind; " +
                "json parse error: json: cannot unmarshal string into Go value of type struct " +
                "{ APIVersion string \"json:\\\"apiVersion,omitempty\\\"\"; Kind string \"json:\\\"kind,omitempty\\\"\" }";
        assertTrue(exception.getMessage().contains(expected));
    }

    @Test
    public void getAllCRD_whenAGraphExists_itemsIsNotEmpty() throws GaaSRestApiException {
        final String jsonString = "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                "\"kind\":\"Gaffer\"," +
                "\"metadata\":{\"name\":\"" + TEST_GRAPH_ID + "\"}," +
                "\"spec\":{\"graph\":{\"config\":{\"graphId\":\"" + TEST_GRAPH_ID + "\",\"description\":\"" + TEST_GRAPH_DESCRIPTION + "\"}}}}";

        final JsonObject jsonRequestBody = new JsonParser().parse(jsonString).getAsJsonObject();
        crdClient.createCRD(jsonRequestBody);

        assertTrue(crdClient.getAllCRD().toString().contains("testgraphid"));
    }

    @AfterEach
    void tearDown() {
        final CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        String version = "v1"; // String | the custom resource's version
        String plural = "gaffers"; // String | the custom resource's plural name. For TPRs this would be lowercase plural kind.
        String name = TEST_GRAPH_ID; // String | the custom object's name

        try {
            apiInstance.deleteNamespacedCustomObject(group, version, namespace, plural, name, null, null, null, null, null);
        } catch (Exception e) {

        }
    }
}
