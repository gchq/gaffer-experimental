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

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.gaas.client.GafferClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSAddCollaboratorRequestBody;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@UnitTest
public class UpdateGraphCollaboratorServiceTest {
    @MockBean
    GafferClient gafferClient;
    @Autowired
    private UpdateGraphCollaboratorsService updateGraphCollaboratorsService;

    @Test
    void shouldReturnTrueWhenAddingCollaboratorSuccessful() {
        GaaSAddCollaboratorRequestBody gaaSAddCollaboratorRequestBody = new GaaSAddCollaboratorRequestBody("myGraph", "myUser");
        when(gafferClient.addCollaborator(gaaSAddCollaboratorRequestBody)).thenReturn(true);

        final boolean actual = updateGraphCollaboratorsService.updateCollaborators(gaaSAddCollaboratorRequestBody);

        assertTrue(actual);
    }

    @Test
    void shouldReturnTrueWhenAddingCollaboratorWithUsernameSuccessful() throws GaaSRestApiException {
        GaaSAddCollaboratorRequestBody gaaSAddCollaboratorRequestBody = new GaaSAddCollaboratorRequestBody("myGraph", "myUser");
        when(gafferClient.addCollaboratorWithUsername(gaaSAddCollaboratorRequestBody, "myUser")).thenReturn(true);

        final boolean actual = updateGraphCollaboratorsService.updateCollaboratorsWithUsername(gaaSAddCollaboratorRequestBody, "myUser");

        assertTrue(actual);
    }
}
