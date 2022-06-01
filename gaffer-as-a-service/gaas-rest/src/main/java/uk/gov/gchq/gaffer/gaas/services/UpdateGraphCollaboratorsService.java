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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.client.GafferClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSAddCollaboratorRequestBody;

@Service
public class UpdateGraphCollaboratorsService {
    @Autowired
    private GafferClient gafferClient;

    public boolean updateCollaborators(final GaaSAddCollaboratorRequestBody requestBody) throws GaaSRestApiException {
        return gafferClient.addCollaborator(requestBody);
    }
    public boolean updateCollaboratorsWithUsername(final GaaSAddCollaboratorRequestBody requestBody, final String username) throws GaaSRestApiException {
        return gafferClient.addCollaboratorWithUsername(requestBody, username);
    }
}
