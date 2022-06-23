/*
 * Copyright 2022 Crown Copyright
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

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.gaas.client.GafferClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GraphCollaborator;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;

@UnitTest
public class GetCollaboratorsServiceTest {
    @Autowired
    private GetCollaboratorsService getCollaboratorsService;
    @MockBean
    private GafferClient gafferClient;
    @MockBean
    private Counter mockCounter;
    @MockBean
    private MeterRegistry meterRegistry;

    @BeforeEach
    void beforeEach() {
        reset(mockCounter);
    }

    @Test
    void shouldReturnListOfCollaboratorsWhenGetCollaboratorsSuccessful() throws GaaSRestApiException {
        final GraphCollaborator graphCollaborator = new GraphCollaborator().graphId("someGraph").username("someCollaborator");

        final List<GraphCollaborator> collaborators = new ArrayList<>();
        collaborators.add(graphCollaborator);
        when(gafferClient.getGraphCollaborators("myGraph")).thenReturn(collaborators);
        when(meterRegistry.counter(anyString(), ArgumentMatchers.<String>any())).thenReturn(mockCounter);

        final List<GraphCollaborator> actual = getCollaboratorsService.getGraphCollaborators("myGraph");

        assertEquals(collaborators, actual);
    }

    @Test
    void shouldReturnListOfCollaboratorsWhenGetCollaboratorsByUsernameSuccessful() throws GaaSRestApiException {
        final GraphCollaborator graphCollaborator = new GraphCollaborator().graphId("someGraph").username("someCollaborator");

        final List<GraphCollaborator> collaborators = new ArrayList<>();
        collaborators.add(graphCollaborator);
        when(gafferClient.getGraphCollaboratorsByUsername("myGraph", "myUser")).thenReturn(collaborators);
        when(meterRegistry.counter(anyString(), ArgumentMatchers.<String>any())).thenReturn(mockCounter);

        final List<GraphCollaborator> actual = getCollaboratorsService.getGraphCollaboratorsByUsername("myGraph", "myUser");

        assertEquals(collaborators, actual);
    }
}
