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

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.gaas.model.Graph;
import static uk.gov.gchq.gaffer.gaas.converters.CrdExceptionHandler.handle;

@Service
public class CreateGraphService {

    @Autowired
    private ApiClient apiClient;

    @Autowired
    private CRDClient crdClient;

    public void createGraph(final Graph graph) throws GaaSRestApiException {
        CustomObjectsApi customObject = new CustomObjectsApi(apiClient);
        String jsonString = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"" + graph.getGraphId() + "\"},\"spec\":{\"graph\":{\"config\":{\"graphId\":\"" + graph.getGraphId() + "\",\"description\":\"" + graph.getDescription() + "\"}}}}";
        final JsonObject jsonRequestBody = new JsonParser().parse(jsonString).getAsJsonObject();
        try {
            crdClient.createCRDObject(jsonRequestBody);
        } catch (ApiException e) {
            handle(e);
        }
    }
}
