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
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import uk.gov.gchq.gaffer.store.library.FileGraphLibrary;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@UnitTest
class GetGafferServiceTest {

    protected static final String TEST_GRAPH_ID = "testgraphid";
    protected static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";

    @Autowired
    private GetGafferService getGafferService;

    @MockBean
    CRDClient crdClient;

    @Test
    void testGetGraphs_whenGraphRequestIsNotEmpty() throws GaaSRestApiException {
        final GraphConfig graph = new GraphConfig.Builder()
                .graphId(TEST_GRAPH_ID)
                .description(TEST_GRAPH_DESCRIPTION)
                .library(new FileGraphLibrary())
                .build();
        final ArrayList<GraphConfig> graphList = new ArrayList<>();
        graphList.add(graph);
        when(crdClient.listAllCRDs()).thenReturn(graphList);

        final List<GraphConfig> actual = getGafferService.getAllGraphs();

        assertEquals(TEST_GRAPH_ID, actual.get(0).getGraphId());
        assertEquals(TEST_GRAPH_DESCRIPTION, actual.get(0).getDescription());
        assertArrayEquals(graphList.toArray(), actual.toArray());
    }

    @Test
    void testGetGraphs_whenGraphRequestIsEmpty() throws GaaSRestApiException {
        final List<GraphConfig> graphList = new ArrayList<>();
        when(crdClient.listAllCRDs()).thenReturn(graphList);

        final List<GraphConfig> actual = getGafferService.getAllGraphs();

        assertEquals(0, actual.size());
    }
}
