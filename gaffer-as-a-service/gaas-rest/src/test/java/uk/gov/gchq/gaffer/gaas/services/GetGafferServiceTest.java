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

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@UnitTest
class GetGafferServiceTest {

    @Autowired
    private GetGafferService getGafferService;

    @MockBean
    private CRDClient crdClient;

    private static final String TEST_GRAPH_ID = "testgraphid";
    private static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";
    private static final String TEST_GRAPH_URL = "graph-namespace.k8s.my.cluster/rest";
    private static final RestApiStatus TEST_GRAPH_STATUS = RestApiStatus.UP;
    private static final List<String>  TEST_GRAPH_PROBLEMS = new ArrayList<String>(Arrays.asList("There is problem with this Graph"));


    @Test
    void testGetGraphs_whenGraphRequestIsNotEmpty() throws GaaSRestApiException {

        final GaaSGraph graph = new GaaSGraph()
                .graphId(TEST_GRAPH_ID)
                .description(TEST_GRAPH_DESCRIPTION)
                .url(TEST_GRAPH_URL)
                .status(TEST_GRAPH_STATUS)
                .problems(TEST_GRAPH_PROBLEMS);
        final List<GaaSGraph> graphList = new ArrayList<>();
        graphList.add(graph);
        Map<String, List<GaaSGraph>> graphs = new HashMap<>();
        graphs.put("graphs", graphList);
        when(crdClient.listAllCRDs()).thenReturn(graphs);

        final Map<String, List<GaaSGraph>> actual = getGafferService.getAllGraphs();

        assertEquals(TEST_GRAPH_ID, actual.get("graphs").get(0).getGraphId());
        assertEquals(TEST_GRAPH_DESCRIPTION, actual.get("graphs").get(0).getDescription());
        assertEquals(TEST_GRAPH_URL, actual.get("graphs").get(0).getUrl());
        assertEquals(TEST_GRAPH_STATUS, actual.get("graphs").get(0).getStatus());
        assertEquals(TEST_GRAPH_PROBLEMS, actual.get("graphs").get(0).getProblems());
        assertEquals(1, actual.get("graphs").size());
    }

    @Test
    void testGetGraphs_whenGraphRequestIsEmpty() throws GaaSRestApiException {
        final List<GaaSGraph> graphList = new ArrayList<>();
        Map<String, List<GaaSGraph>> graphs = new HashMap<>();
        graphs.put("graphs", graphList);
        when(crdClient.listAllCRDs()).thenReturn(graphs);

        final Map<String, List<GaaSGraph>> actual = getGafferService.getAllGraphs();

        assertEquals(0, actual.get("graphs").size());
    }
}
