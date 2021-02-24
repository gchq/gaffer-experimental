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
package uk.gov.gchq.gaffer.gaas.services;

import io.kubernetes.client.openapi.ApiException;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.gaas.model.Graph;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
public class CreateGraphServiceTest {
    @MockBean
    private CRDClient crdClient;
    @Autowired
    private CreateGraphService createGraphService;

    @Disabled
    public void testThrowsGaaSExceptionWhenCreateCRDObjectThrowsAPIException() throws Exception {
        final String requestBody = "{\"graphId\":\"some graph \",\"description\":\"" + "test" + "\"}";
        final Map<String, List<String>> responseHeaders = new TreeMap<>();
        responseHeaders.put("content-type", Arrays.asList("application/json"));
        final String responseBody = "{\"kind\":\"Status\",\"apiVersion\":\"v1\",\"metadata\":{},\"status\":\"Failure\",\"message\":\"gaffers.gchq.gov.uk \\\"testgraphid\\\" already exists\",\"reason\":\"AlreadyExists\",\"details\":{\"name\":\"testgraphid\",\"group\":\"gchq.gov.uk\",\"kind\":\"gaffers\"},\"code\":409}\n";

        doThrow(new ApiException("Conflict", 409, responseHeaders, responseBody)).when(crdClient)
                .createCRDObject(requestBody);

        final Graph graph = new Graph("some graph", "test");
        assertThrows(GaaSRestApiException.class, () -> createGraphService.createGraph(graph));


    }

}
