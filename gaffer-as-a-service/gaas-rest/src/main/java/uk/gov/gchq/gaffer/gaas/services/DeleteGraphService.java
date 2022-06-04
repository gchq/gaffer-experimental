/*
 * Copyright 2021-2022 Crown Copyright
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

@Service
public class DeleteGraphService {

    @Autowired
    private GafferClient gafferClient;

    @Autowired
    private MeterRegistry meterRegistry;

    private static final Logger LOGGER = LoggerFactory.getLogger(DeleteGraphService.class);

    @Timed(value = "deleteGraph.time", description = "Time taken to delete graph", percentiles = 0)
    public boolean deleteGraph(final String graphId) throws GaaSRestApiException {
        meterRegistry.counter("DeleteGraphService", "action", "delete").increment();
        LOGGER.info("Delete GaaS Graph = {}", graphId);
        return gafferClient.deleteGaffer(graphId);
    }

    @Timed(value = "deleteGraphByUsername.time", description = "Time taken to delete graph", percentiles = 0)
    public boolean deleteGraphByUsername(final String graphId, final String username) throws GaaSRestApiException {
        meterRegistry.counter("DeleteGraphService", "action", "delete").increment();
        return gafferClient.deleteGafferByUsername(graphId, username);
    }
}
