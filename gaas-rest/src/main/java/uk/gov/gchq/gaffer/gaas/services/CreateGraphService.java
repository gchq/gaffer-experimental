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

import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.factories.GaaSRestExceptionFactory;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import static uk.gov.gchq.gaffer.gaas.factories.GafferHelmValuesFactory.from;

@Service
public class CreateGraphService {

    @Autowired
    private CRDClient crdClient;

    public void createGraph(final GaaSCreateRequestBody gaaSCreateRequestBodyInput) throws GaaSRestApiException {
        try {
            crdClient.createCRD(makeGafferHelmValues(gaaSCreateRequestBodyInput));
        } catch (Exception e){
            ApiException ex = new ApiException("internal server error", null, 500, null, null);
            throw GaaSRestExceptionFactory.from(ex);
        }

    }

    private Gaffer makeGafferHelmValues(final GaaSCreateRequestBody graph) {
        return from(graph);
    }
}
