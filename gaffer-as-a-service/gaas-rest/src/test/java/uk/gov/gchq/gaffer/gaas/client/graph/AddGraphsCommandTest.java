/*
 *
 *  * Copyright 2021 Crown Copyright
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package uk.gov.gchq.gaffer.gaas.client.graph;

import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.client.graph.AddGraphsCommand;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.exception.GraphOperationException;
import uk.gov.gchq.gaffer.gaas.model.ProxySubGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@UnitTest
public class AddGraphsCommandTest {

    private static List<ProxySubGraph> SUB_GRAPHS = Arrays.asList(new ProxySubGraph("valid", "host only -DO NOT INCLUDE protocol", "/rest"));


    @Test
    public void invalidRequestBody_() {
        final String url = "http://localhost:8080/notfound";

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsCommand(url, SUB_GRAPHS).execute());

        assertEquals("404 Not Found from POST http://localhost:8080/notfound/graph/operations/execute", actual.getMessage());
    }


    @Test
    public void invalidURIPath_() {
        final String url = "http://localhost:8080/notfound";

        final GraphOperationException actual = assertThrows(GraphOperationException.class, () -> new AddGraphsCommand(url, SUB_GRAPHS).execute());

        assertEquals("404 Not Found from POST http://localhost:8080/notfound/graph/operations/execute", actual.getMessage());
    }

    @Test
    public void invalidHost_() {
        final String url = "http://localhost:404/rest";

        final GaaSRestApiException actual = assertThrows(GaaSRestApiException.class, () -> new AddGraphsCommand(url, SUB_GRAPHS).execute());

        final String expected = "Connection refused: localhost/127.0.0.1:404; " +
                "nested exception is io.netty.channel.AbstractChannel$AnnotatedConnectException: Connection refused: localhost/127.0.0.1:404";
        assertEquals(expected, actual.getMessage());
    }


}