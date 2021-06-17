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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.util.GaaSGraphConfigsLoader;
import static uk.gov.gchq.gaffer.gaas.factories.GafferFactory.from;

@Service
public class CreateGraphService {

    @Autowired
    private GaaSGraphConfigsLoader loader;

    @Autowired
    private CRDClient crdClient;

    @Timed(value = "createGraph.time", description = "Time taken to create graph", percentiles = 0)
    public void createGraph(final GaaSCreateRequestBody gaaSCreateRequestBodyInput) throws GaaSRestApiException {

        final GafferSpec config = loader.getConfig("/config", gaaSCreateRequestBodyInput.getConfigName());
        crdClient.createCRD(overrideConfig(config, gaaSCreateRequestBodyInput));
    }

    private Gaffer overrideConfig(final GafferSpec gafferSpecConfig, final GaaSCreateRequestBody overrides) {
        return from(gafferSpecConfig, overrides);
    }
}
