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

package uk.gov.gchq.gaffer.gaas.services;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@UnitTest
public class CreateGraphServiceTest {
    @Autowired
    private CreateGraphService createGraphService;
    @MockBean
    private CRDClient crdClient;

    @Test
    public void createAccumuloGraph_shouldCallCrdClientWithCreateGraphRequestAndCorrectGraphConfigAndAccumuloEnabled() throws GaaSRestApiException {
        createGraphService.createGraph(new GaaSCreateRequestBody("myGraph", "Another description", StoreType.ACCUMULO));
        final ArgumentCaptor<Gaffer> argumentCaptor = ArgumentCaptor.forClass(Gaffer.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());
        final Gaffer gafferRequestBody = argumentCaptor.<Gaffer>getValue();
        assertEquals("myGraph", gafferRequestBody.getMetadata().getName());
        final GafferSpec spec = gafferRequestBody.getSpec();
        assertEquals("myGraph", spec.getNestedObject("graph", "config", "graphId"));
        assertEquals("Another description", spec.getNestedObject("graph", "config", "description"));
        assertEquals(true, spec.getNestedObject("accumulo", "enabled"));
    }

    @Test
    public void createMapGraph_shouldCallCrdClientWithMapStoreRequest_andAccumuloConfigShouldBeNull() throws GaaSRestApiException {
        createGraphService.createGraph(new GaaSCreateRequestBody("myGraph", "Another description", StoreType.MAPSTORE));
        final ArgumentCaptor<Gaffer> argumentCaptor = ArgumentCaptor.forClass(Gaffer.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());
        final Gaffer gafferRequestBody = argumentCaptor.<Gaffer>getValue();
        assertEquals("myGraph", gafferRequestBody.getMetadata().getName());
        final GafferSpec spec = gafferRequestBody.getSpec();
        assertEquals("myGraph", spec.getNestedObject("graph", "config", "graphId"));
        assertEquals("Another description", spec.getNestedObject("graph", "config", "description"));
        //assertEquals("", spec.getGraph().getStorePropertyClassName());
        assertEquals(null, spec.getNestedObject("accumulo", "enabled"));
    }
}
