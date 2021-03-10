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
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class CRDCreateRequestBodyTest {

    private final Gson gson = new Gson();

    @Test
    public void shouldReflectCreateGafferJsonRequestBody() {
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");
        final CRDCreateRequestBody requestBody = new CRDCreateRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(new GraphSpec()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId("MyGraph")
                                        .description("My Graph deployed by the Controller")
                                        .library(null)
                                        .build())));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\"," +
                        "\"kind\":\"Gaffer\"," +
                        "\"metadata\":{\"name\":\"my-gaffer\"}," +
                        "\"spec\":{\"" +
                        "graph\":{\"" +
                        "config\":{\"graphId\":\"MyGraph\",\"library\":{},\"description\":\"My Graph deployed by the Controller\",\"hooks\":[]}}}}";

        assertEquals(expected, gson.toJson(requestBody));
    }
}
