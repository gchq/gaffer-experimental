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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.gaas.model.CreateGafferRequestBody;
import uk.gov.gchq.gaffer.gaas.model.Graph;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static uk.gov.gchq.gaffer.gaas.utilities.CreateGraphRequestTestFactory.makeCreateCRDRequestBody;

@SpringBootTest
public class CRDClientIT {

    @Autowired
    private CreateGraphService createGraphService;

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
    public void createCRD_whenCorrectRequest_shouldNotThrowAnyException() {
        final CreateGafferRequestBody gafferRequest = makeCreateCRDRequestBody(new Graph("validgraph", "A description"));

        assertDoesNotThrow(() -> crdClient.createCRD(gafferRequest));
    }

    @Test
    public void createCRD_whenNullRequestObject() {
        assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(null));
    }

    // TODO: Run this test and assert current outcome
    @Test
    public void createCRD_whenGraphIdHasUppercase_throwsException() {
        final CreateGafferRequestBody gafferRequest = makeCreateCRDRequestBody(new Graph("UPPERCASEgraph", "A description"));

        assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(gafferRequest));
    }

    // TODO: Run this test and assert current outcome
    @Test
    public void createCRD_whenCreateRequestBodyHasNullValues_throws___() {
        final CreateGafferRequestBody requestBody = new CreateGafferRequestBody();

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(requestBody));

        assertEquals(400, exception.getStatusCode());
        assertEquals("BadRequest", exception.getBody());
        final String expected = "Gaffer in version \"v1\" cannot be handled as a Gaffer: unmarshalerDecoder: " +
                "Object 'Kind' is missing in '{}', error found in #2 byte of ...|{}|..., bigger context ...|{}|...";
        assertEquals(expected, exception.getMessage());
    }

    @Test
    public void getAllCRD_whenAGraphExists_itemsIsNotEmpty() throws GaaSRestApiException {
        crdClient.createCRD(makeCreateCRDRequestBody(new Graph(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION)));

        assertTrue(crdClient.getAllCRD().toString().contains("testgraphid"));
    }

    @Test
    public void getAllCRD_whenNoGraphs_itemsIsEmpty() throws GaaSRestApiException {
        assertTrue(crdClient.getAllCRD().toString().contains("items=[]"));
    }

    // TODO: Ensure properly implements and all graphs are torn down after each test
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
