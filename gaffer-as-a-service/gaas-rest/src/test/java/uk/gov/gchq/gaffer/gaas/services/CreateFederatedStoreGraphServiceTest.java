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

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;


@UnitTest
class CreateFederatedStoreGraphServiceTest {

    @Autowired
    private CreateFederatedStoreGraphService service;

    @MockBean
    private CRDClient crdClient;
    /*TODO: Take in a request,
       Create a federated graph
       Get the URL
       Add proxy stores by sending requests to the url
    *  */
    @Test
    public void shouldSendTheCorrectRequestToTheCRDClientWhenCreatingAFederatedGraph() throws GaaSRestApiException {
        service.createFederatedStore(new GaaSCreateRequestBody("federatedGraph", "federated-graph-description", StoreType.FEDERATED_STORE));

        final ArgumentCaptor<Gaffer> argumentCaptor = ArgumentCaptor.forClass(Gaffer.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());
        final Gaffer gafferRequestBody = argumentCaptor.<Gaffer>getValue();
        assertEquals("federatedGraph", gafferRequestBody.getMetadata().getName());

        final GafferSpec spec = gafferRequestBody.getSpec();
        assertEquals("federatedGraph", spec.getNestedObject("graph", "config", "graphId"));
        assertEquals("federated-graph-description", spec.getNestedObject("graph", "config", "description"));
    }

    @Test
    public void shouldGetTheURLOfTheCreatedFederatedStoreGraph() throws GaaSRestApiException {
        service.createFederatedStore(new GaaSCreateRequestBody("federatedGraph", "federated-graph-description", StoreType.FEDERATED_STORE));


    }
}