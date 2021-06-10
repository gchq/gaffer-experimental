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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.StoreTypesEndpointResponse;
import uk.gov.gchq.gaffer.gaas.util.PropertiesLoader;
import javax.validation.constraints.NotNull;
import java.io.IOException;


@Service
public final class GetStoreTypesService {

  @Autowired
  PropertiesLoader propertiesLoader;

    @Autowired
    StoreTypesEndpointResponse storeTypesEndpointResponse;

    @NotNull
    public StoreTypesEndpointResponse getStoreTypes() throws GaaSRestApiException {

        try {
          storeTypesEndpointResponse = propertiesLoader.getStoreTypesEndpointResponse();

        } catch (IOException e) {
            throw new GaaSRestApiException(e.getMessage(), e.getLocalizedMessage(), 500);
    }
    return storeTypesEndpointResponse;
  }
}
