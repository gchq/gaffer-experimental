package uk.gov.gchq.gaffer.gaas.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.gaas.client.GafferClient;
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
    void shouldReturnTrueWhenAddingCollaboratorSuccessful(){
        GaaSAddCollaboratorRequestBody gaaSAddCollaboratorRequestBody = new GaaSAddCollaboratorRequestBody("myGraph","myUser");
        when(gafferClient.addCollaborator(gaaSAddCollaboratorRequestBody)).thenReturn(true);

        final boolean actual = updateGraphCollaboratorsService.updateCollaborators(gaaSAddCollaboratorRequestBody);

        assertTrue(actual);
    }
}
