package uk.gov.gchq.gaffer.gaas.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.client.GafferClient;
import uk.gov.gchq.gaffer.gaas.model.GaaSAddCollaboratorRequestBody;

@Service
public class UpdateGraphCollaboratorsService {
    @Autowired
    private GafferClient gafferClient;

    public boolean updateCollaborators(final GaaSAddCollaboratorRequestBody requestBody){
        return gafferClient.addCollaborator(requestBody);
    }
}
