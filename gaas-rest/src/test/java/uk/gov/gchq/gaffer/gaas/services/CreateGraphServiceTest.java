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
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
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
    public void createGraph_shouldCallCrdClientWithCreateGraphRequestAndCorrectGraphConfig() throws GaaSRestApiException {
        createGraphService.createGraph(new GaaSCreateRequestBody("myGraph", "Another description"));

        final ArgumentCaptor<CRDCreateRequestBody> argumentCaptor = ArgumentCaptor.forClass(CRDCreateRequestBody.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());

        final CRDCreateRequestBody gafferRequestBody = argumentCaptor.<CRDCreateRequestBody>getValue();
        assertEquals("myGraph", gafferRequestBody.getSpec().getGraph().getConfig().getGraphId());
        assertEquals("Another description", gafferRequestBody.getSpec().getGraph().getConfig().getDescription());
        assertEquals("myGraph", gafferRequestBody.getMetadata().getName());
    }
}
