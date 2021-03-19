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

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class CRDRequestBodyFactoryTest {
    private final Gson gson = new Gson();

    @Test
    public void federatedStoreRequestShouldReturnFederatedRequestBody()
    {
        CRDRequestBodyFactory crdRequestBodyFactory = new CRDRequestBodyFactory();
        final CreateCRDRequestBody requestBody = crdRequestBodyFactory.buildRequest(new GaaSCreateRequestBody("MyGraph", "Another description", StoreType.FEDERATED_STORE));
        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"MyGraph\"}," +
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"" +
                        "graphId\":\"MyGraph\",\"" +
                        "library\":{},\"" +
                        "description\":\"Another description\",\"" +
                        "hooks\":[]" +
                        "}," +
                        "\"storeProperties\":{\"" +
                        "gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"" +
                        "gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"" +
                        "gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"" +
                        "}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }
    @Test
    public void accumuloStoreRequestShouldReturnAccumuloRequestBody()
    {
        CRDRequestBodyFactory crdRequestBodyFactory = new CRDRequestBodyFactory();
        final CreateCRDRequestBody requestBody = crdRequestBodyFactory.buildRequest(new GaaSCreateRequestBody("MyGraph", "Another description", StoreType.ACCUMULO));
        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"MyGraph\"}," +
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"" +
                        "graphId\":\"MyGraph\",\"library\":{},\"description\":\"Another description\",\"hooks\":[]" +
                        "}" +
                        "},\"" +
                        "accumulo\":{\"" +
                        "enabled\":true" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }
    @Test
    public void mapStoreStoreRequestShouldReturnMapStoreRequestBody()
    {
        CRDRequestBodyFactory crdRequestBodyFactory = new CRDRequestBodyFactory();
        final CreateCRDRequestBody requestBody = crdRequestBodyFactory.buildRequest(new GaaSCreateRequestBody("MyGraph", "Another description", StoreType.MAPSTORE));
        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"MyGraph\"}," +
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"" +
                        "graphId\":\"MyGraph\",\"" +
                        "library\":{},\"" +
                        "description\":\"Another description\",\"" +
                        "hooks\":[]" +
                        "}" +
                        "}" +
                        "}" +
                        "}";
        assertEquals(expected, gson.toJson(requestBody));
    }
}
