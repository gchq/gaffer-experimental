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

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.FederatedRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@UnitTest
class CreateFederatedStoreGraphServiceTest {

    @Autowired
    private CreateFederatedStoreGraphService service;

    @MockBean
    private CRDClient crdClient;

    private static final String TEST_GRAPH_ID = "testgraphid";
    private static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";
    private static final String TEST_GRAPH_URL = "graph-namespace.k8s.my.cluster/rest";
    private static final RestApiStatus TEST_GRAPH_STATUS = RestApiStatus.UP;
    private static final List<String> TEST_GRAPH_PROBLEMS = new ArrayList<String>(Arrays.asList("There is problem with this Graph"));
    private List<ProxySubGraph> proxySubGraphs;


    /*TODO: Take in a request,
           Create a federated graph
           Get the URL
           Add proxy stores by sending requests to the url
        *  */

    @Test
    void shouldThrowErrorWhenSubGraphsEmpty() {
        assertThrows(GaaSRestApiException.class,()-> service.createFederatedStore(new FederatedRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, "federatedStore", proxySubGraphs)));
    }

    @Disabled
    @Test
    public void shouldSendTheCorrectRequestToTheCRDClientWhenCreatingAFederatedGraph() throws GaaSRestApiException {
        service.createFederatedStore(new GaaSCreateRequestBody(TEST_GRAPH_ID, TEST_GRAPH_DESCRIPTION, "StoreType.FEDERATED_STORE"));

        final ArgumentCaptor<Gaffer> argumentCaptor = ArgumentCaptor.forClass(Gaffer.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());
        final Gaffer gafferRequestBody = argumentCaptor.<Gaffer>getValue();
        assertEquals(TEST_GRAPH_ID, gafferRequestBody.getMetadata().getName());

        final GafferSpec spec = gafferRequestBody.getSpec();
        assertEquals(TEST_GRAPH_ID, spec.getNestedObject("graph", "config", "graphId"));
        assertEquals(TEST_GRAPH_DESCRIPTION, spec.getNestedObject("graph", "config", "description"));
    }

    @Disabled
    @Test
    public void shouldGetTheURLOfTheCreatedFederatedStoreGraph() {
        final GaaSGraph graph = new GaaSGraph()
                .graphId(TEST_GRAPH_ID)
                .description(TEST_GRAPH_DESCRIPTION)
                .url(TEST_GRAPH_URL)
                .status(TEST_GRAPH_STATUS)
                .problems(TEST_GRAPH_PROBLEMS);
//        when(crdClient.getCRDByGraphId(TEST_GRAPH_ID)).thenReturn(graph);

//        final String federatedGraphURL = service.getFederatedGraphURL(TEST_GRAPH_ID);

//        assertEquals(TEST_GRAPH_URL, federatedGraphURL);
    }
}