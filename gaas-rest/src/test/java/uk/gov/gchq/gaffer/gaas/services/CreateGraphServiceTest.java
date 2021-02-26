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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.gaas.model.CreateGafferRequestBody;
import uk.gov.gchq.gaffer.gaas.model.Graph;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
public class CreateGraphServiceTest {

    @Autowired
    private CreateGraphService createGraphService;

    @MockBean
    private CRDClient crdClient;

    @Test
    public void createGraph_shouldCallCrdClientWithCreateGraphRequestAndCorrectGraphConfig() throws GaaSRestApiException {
        createGraphService.createGraph(new Graph("myGraph", "Another description"));

        final ArgumentCaptor<CreateGafferRequestBody> argumentCaptor = ArgumentCaptor.forClass(CreateGafferRequestBody.class);
        verify(crdClient, times(1)).createCRD(argumentCaptor.capture());

        final CreateGafferRequestBody gafferRequestBody = argumentCaptor.<CreateGafferRequestBody>getValue();
        assertEquals("myGraph", gafferRequestBody.getSpec().getGraph().getConfig().getGraphId());
        assertEquals("Another description", gafferRequestBody.getSpec().getGraph().getConfig().getDescription());
        assertEquals("myGraph", gafferRequestBody.getMetadata().getName());
    }
}
