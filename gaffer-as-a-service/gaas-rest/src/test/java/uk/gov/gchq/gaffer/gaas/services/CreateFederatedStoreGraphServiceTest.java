/*
 * Copyright 2021 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.services;

import io.kubernetes.client.common.KubernetesObject;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.client.graph.GraphCommandExecutor;
import uk.gov.gchq.gaffer.gaas.client.graph.ValidateGraphHostOperation;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@UnitTest
class CreateFederatedStoreGraphServiceTest {

    @Autowired
    private CreateFederatedStoreGraphService service;

    @MockBean
    private CRDClient crdClient;

    @MockBean
    private GraphCommandExecutor graphCommandExecutor;

    private static final String TEST_GRAPH_ID = "testgraphid";
    private static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";

    private final ProxySubGraph proxySubGraph = new ProxySubGraph("TestGraph", "invalid", "invalid");
    private final ProxySubGraph proxySubGraph2 = new ProxySubGraph("TestGraph2", "invalid2", "invalid2");

    @Test
    void shouldThrowError_WhenSubGraphsListIsEmpty() {
        final List<ProxySubGraph> proxySubGraphs = new ArrayList<>();

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphs)));

        assertEquals("There are no sub-graphs to add", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST.value(), exception.getStatusCode());
    }

    @Test
    void shouldThrowInvalidUrlMessageForSingleUrl_WhenASingleSubGraphHasInvalidURL() throws GraphOperationException {
        doThrow(new GraphOperationException("Invalid Proxy Graph URL")).when(graphCommandExecutor).execute(any(ValidateGraphHostOperation.class));
        final List<ProxySubGraph> proxySubGraphsList = Arrays.asList(proxySubGraph);

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphsList)));

        final String expected = "Invalid Proxy Graph URL(s): [TestGraph: Invalid Proxy Graph URL]";
        assertEquals(expected, exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST.value(), exception.getStatusCode());
    }

    @Test
    void shouldThrowInvalidURLExceptionForAllUrls_WhenAllSubGraphsHaveInvalidURLs() throws GraphOperationException {
        doThrow(new GraphOperationException("The request to testGraph returned: 500 Internal Server Error"))
                .doThrow(new GraphOperationException("TestGraph2 has invalid host. Reason: connection refused at TestGraph2"))
                .when(graphCommandExecutor).execute(any(ValidateGraphHostOperation.class));
        final List<ProxySubGraph> proxySubGraphsList = Arrays.asList(proxySubGraph, proxySubGraph2);

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphsList)));

        final String expected = "Invalid Proxy Graph URL(s): [TestGraph: The request to testGraph returned: 500 Internal Server Error, TestGraph2: TestGraph2 has invalid host. Reason: connection refused at TestGraph2]";
        assertEquals(expected, exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST.value(), exception.getStatusCode());
    }

    @Test
    public void shouldCreateAFedStoreGraph_whenAllURLsAreValid() throws GraphOperationException, GaaSRestApiException {
        doNothing().when(graphCommandExecutor).execute(any(ValidateGraphHostOperation.class));
        final ProxySubGraph subGraph = new ProxySubGraph("TestGraph2", "invalid", "invalid");
        final List<ProxySubGraph> proxySubGraphsList = Arrays.asList(subGraph);

        service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphsList));

        verify(crdClient, times(1)).createCRD(any(KubernetesObject.class));
    }

    @Test
    public void shouldThrowGaaSException_whenCreateCRDThrowsGaaSException() throws GaaSRestApiException, GraphOperationException {
        doNothing().when(graphCommandExecutor).execute(any(ValidateGraphHostOperation.class));
        doThrow(GaaSRestApiException.class).when(crdClient).createCRD(any(KubernetesObject.class));
        final ProxySubGraph subGraph = new ProxySubGraph("TestGraph2", "invalid", "invalid");
        final List<ProxySubGraph> proxySubGraphsList = Arrays.asList(subGraph);

        assertThrows(GaaSRestApiException.class, () -> service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphsList)));
    }

    @Test
    public void shouldSendTheCorrectRequestToTheCRDClientWhenCreatingAFederatedGraph() throws GaaSRestApiException {
        final List<ProxySubGraph> proxySubGraphsList = Arrays.asList(proxySubGraph, proxySubGraph2);
        service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphsList));

        final ArgumentCaptor<Gaffer> argumentCaptor = ArgumentCaptor.forClass(Gaffer.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());
        final Gaffer gafferRequestBody = argumentCaptor.<Gaffer>getValue();
        assertEquals(TEST_GRAPH_ID, gafferRequestBody.getMetadata().getName());

        final GafferSpec spec = gafferRequestBody.getSpec();
        assertEquals(TEST_GRAPH_ID, spec.getNestedObject("graph", "config", "graphId"));
        assertEquals(TEST_GRAPH_DESCRIPTION, spec.getNestedObject("graph", "config", "description"));
    }

    @Test
    void shouldThrowInvalidURLExceptionForUrl_WhenOneOfMultipleSubGraphsHasInvalidURL() throws GraphOperationException {
        doThrow(new GraphOperationException("The request to testGraph returned: 500 Internal Server Error"))
                .doNothing()
                .when(graphCommandExecutor).execute(any(ValidateGraphHostOperation.class));
        final List<ProxySubGraph> proxySubGraphsList = Arrays.asList(proxySubGraph, proxySubGraph2);

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, proxySubGraphsList)));

        final String expected = "Invalid Proxy Graph URL(s): [TestGraph: The request to testGraph returned: 500 Internal Server Error]";
        assertEquals(expected, exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST.value(), exception.getStatusCode());
    }

}
