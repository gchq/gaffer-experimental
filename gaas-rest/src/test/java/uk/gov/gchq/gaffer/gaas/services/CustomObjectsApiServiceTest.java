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

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@SpringBootTest
public class CustomObjectsApiServiceTest {

    @Autowired
    CustomObjectsApiService customObjectsApiService;

    @MockBean
    CRDClient crdClient;

    // TODO: Test conversion for refactoring
    @Disabled
    @Test
    public void convertJsonGetGafferResponsToGraphConfigList() throws GaaSRestApiException {
        final String jsonResponse = "{apiVersion=gchq.gov.uk/v1, items=[{apiVersion=gchq.gov.uk/v1, kind=Gaffer, metadata={creationTimestamp=2021-02-26T10:27:51Z, generation=1.0, managedFields=[{apiVersion=gchq.gov.uk/v1, fieldsType=FieldsV1, fieldsV1={f:spec={.={}, f:graph={}}, f:status={.={}, f:restApiStatus={}}}, manager=Kubernetes Java Client, operation=Update, time=2021-02-26T10:27:56Z}], name=my-gaffer, namespace=kai-helm-3, resourceVersion=5870777, selfLink=/apis/gchq.gov.uk/v1/namespaces/kai-helm-3/gaffers/my-gaffer, uid=c1327760-c61c-4991-bf89-d1a7c9835274}, spec={graph={config={description=Test Graph Description, graphId=testgraphid, hooks=[], library={}}}}, status={restApiStatus=DOWN}}], kind=GafferList, metadata={continue=, resourceVersion=5871283, selfLink=/apis/gchq.gov.uk/v1/namespaces/kai-helm-3/gaffers}}";
        when(crdClient.getAllCRD()).thenReturn(jsonResponse);

        final List<GraphConfig> graphs = customObjectsApiService.getAllGraphs();

        assertEquals("", graphs.get(0).getGraphId());
    }
}