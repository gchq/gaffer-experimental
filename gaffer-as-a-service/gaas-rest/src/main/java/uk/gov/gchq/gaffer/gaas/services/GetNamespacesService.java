/*
 * Copyright 2021 Crown Copyright
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
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import java.util.List;

@Service
public class GetNamespacesService {

    @Autowired
    private CRDClient crdClient;

    private final Counter namespacesCounter;

    public GetNamespacesService(@Autowired final MeterRegistry meterRegistry) {
        namespacesCounter = meterRegistry.counter("GetNamespacesService", "action", "get");
    }

    @Timed(value = "getNamespaces.time", description = "Time taken to get all namespaces", percentiles = 0)
    public List<String> getNamespaces() throws GaaSRestApiException {
        namespacesCounter.increment();
        return crdClient.getAllNameSpaces();
    }
}
