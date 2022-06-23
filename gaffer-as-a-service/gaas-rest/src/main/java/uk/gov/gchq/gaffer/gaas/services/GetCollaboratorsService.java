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

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.client.GafferClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GraphCollaborator;

import java.util.List;

@Service
public class GetCollaboratorsService {
    @Autowired
    private GafferClient gafferClient;

    @Autowired
    private MeterRegistry meterRegistry;

    private static final Logger LOGGER = LoggerFactory.getLogger(GetCollaboratorsService.class);

    @Timed(value = "getGraphCollaborators.time", description = "Time taken to get collaborators on a graph", percentiles = 0)
    public List<GraphCollaborator> getGraphCollaborators(final String graphId) throws GaaSRestApiException {
        meterRegistry.counter("GetGafferService", "action", "get").increment();
        LOGGER.info("Get all graphs = ");
        return gafferClient.getGraphCollaborators(graphId);
    }

    @Timed(value = "getGraphCollaboratorsByUsername.time", description = "Time taken to get collaborators on a graph", percentiles = 0)
    public List<GraphCollaborator> getGraphCollaboratorsByUsername(final String graphId, final String username) throws GaaSRestApiException {
        meterRegistry.counter("GetGafferService", "action", "get").increment();
        LOGGER.info("Get all graphs = ");
        return gafferClient.getGraphCollaboratorsByUsername(graphId, username);
    }
}
