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
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.PLURAL;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;
import static uk.gov.gchq.gaffer.gaas.util.GafferKubernetesObjectFactory.from;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

@SpringBootTest
public class CRDClientIT {

    private static final String TEST_GRAPH_ID = "testgraphid";
    private static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";
    private static final String ACCUMULO_ENABLED = "accumulo";

    @Autowired
    private CreateGraphService createGraphService;
    @Autowired
    private CRDClient crdClient;
    @Autowired
    private ApiClient apiClient;

    @Test
    public void createCRD_whenCorrectRequest_shouldNotThrowAnyException() {
        final Gaffer gafferRequest = from(new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), ACCUMULO_ENABLED));

        assertDoesNotThrow(() -> crdClient.createCRD(gafferRequest));
    }

    @Test
    public void createCRD_whenNullRequestObject_throwsMissingRequestBodyGaasException() {
        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(null));

        final String expected = "Kubernetes Cluster Error: Missing the required parameter 'body' when calling createNamespacedCustomObject(Async)";
        assertEquals(expected, exception.getMessage());
        assertEquals(0, exception.getStatusCode());
        assertEquals("Missing the required parameter 'body' when calling createNamespacedCustomObject(Async)", exception.getTitle());
    }

    @Test
    public void createCRD_whenGraphIdHasUppercase_throws422GaasException() {
        final Gaffer gafferRequest = from(new GaaSCreateRequestBody("UPPERCASEgraph", "A description", getSchema(), ACCUMULO_ENABLED));

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(gafferRequest));

        assertEquals(422, exception.getStatusCode());
        assertEquals("Unprocessable Entity", exception.getTitle());
        final String expected = "Kubernetes Cluster Error: (Invalid) Gaffer.gchq.gov.uk \"UPPERCASEgraph\" is invalid: metadata.name: Invalid value: \"UPPERCASEgraph\": a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character (e.g. 'example.com', regex used for validation is '[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*')";
        assertEquals(expected, exception.getMessage());
    }

    @Test
    public void createCRD_whenGraphIdHasSpecialChars_throws422GaasException() {
        final Gaffer gafferRequest = from(new GaaSCreateRequestBody("sp£ci@l_char$", "A description", getSchema(), ACCUMULO_ENABLED));

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(gafferRequest));

        assertEquals(422, exception.getStatusCode());
        assertEquals("Unprocessable Entity", exception.getTitle());
        final String expected = "Kubernetes Cluster Error: (Invalid) Gaffer.gchq.gov.uk \"sp£ci@l_char$\" is invalid: metadata.name: Invalid value: \"sp£ci@l_char$\": a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character (e.g. 'example.com', regex used for validation is '[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*')";
        assertEquals(expected, exception.getMessage());
    }

    @Test
    public void createCRD_whenCreateRequestBodyHasNullValues_throws_400GaasException() {
        final Gaffer requestBody = new Gaffer();

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.createCRD(requestBody));

        assertEquals(400, exception.getStatusCode());
        assertEquals("Bad Request", exception.getTitle());
        final String expected = "Kubernetes Cluster Error: (BadRequest) Gaffer in version \"v1\" cannot be handled as a Gaffer: unmarshalerDecoder: Object 'Kind' is missing in '{}', error found in #2 byte of ...|{}|..., bigger context ...|{}|...";
        assertEquals(expected, exception.getMessage());
    }

    @Test
    public void getAllCRD_whenAGraphExists_itemsIsNotEmpty() throws GaaSRestApiException {
        final Gaffer gafferRequest = from(new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, getSchema(), ACCUMULO_ENABLED));
        crdClient.createCRD(gafferRequest);

        assertTrue(crdClient.listAllCRDs().toString().contains("testgraphid"));
    }

    @Test
    public void getAllCRD_whenNoGraphs_itemsIsEmpty() throws GaaSRestApiException {
        final List<GraphConfig> list = new ArrayList<>();

        assertEquals(list, crdClient.listAllCRDs());
    }

    @Test
    public void deleteCRD_whenGraphDoesntExist_throws404GaasException() {
        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.deleteCRD("non-existing-crd"));

        assertEquals(404, exception.getStatusCode());
        assertEquals("Not Found", exception.getTitle());
        assertEquals("Kubernetes Cluster Error: (NotFound) gaffers.gchq.gov.uk \"non-existing-crd\" not found", exception.getMessage());
    }

    @Test
    public void deleteCRD_whenGraphDoesExist_doesNotThrowException() throws GaaSRestApiException {
        final String existingGraph = "existing-graph-2";

        final Gaffer gafferRequest = from(new GaaSCreateRequestBody(existingGraph, TEST_GRAPH_DESCRIPTION, getSchema(), ACCUMULO_ENABLED));
        crdClient.createCRD(gafferRequest);

        assertDoesNotThrow(() -> crdClient.deleteCRD(existingGraph));
    }

    @Test
    void testGetAllNamespacesReturnsSuccessResponseWithExistingNamespace() throws GaaSRestApiException {
        final List<String> allNameSpaces = crdClient.getAllNameSpaces();

        assertTrue(allNameSpaces.contains(NAMESPACE));
    }

    @AfterEach
    void tearDown() {
        final CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        final String name = TEST_GRAPH_ID;
        try {
            apiInstance.deleteNamespacedCustomObject(GROUP, VERSION, NAMESPACE, PLURAL, name, null, null, null, null, null);
        } catch (Exception e) {
            // Do nothing
        }
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
}
