/*
 * Copyright 2020 Crown Copyright
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
package uk.gov.gchq.gaffer.gaas.model;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.springframework.stereotype.Service;

@Service
public class CRDRequestBodyFactory {
    public CreateCRDRequestBody buildRequest(final GaaSCreateRequestBody graph) {
        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());
        final StoreType storeType = graph.getStoreType();
        switch (storeType) {
            case ACCUMULO:
                return new AccumuloRequestBody().buildRequestBody(graph);
            case MAPSTORE:
                return new MapstoreRequestBody().buildRequestBody(graph);
            case FEDERATED_STORE:
                return new FederatedRequestBody().buildRequestBody(graph);
            default:
                throw new IllegalArgumentException("Unsupported store type");
        }

    }
}
