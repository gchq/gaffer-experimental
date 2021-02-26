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
package uk.gov.gchq.gaffer.gaas.utilities;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import uk.gov.gchq.gaffer.gaas.model.CreateGafferRequestBody;
import uk.gov.gchq.gaffer.gaas.model.Graph;
import uk.gov.gchq.gaffer.gaas.model.GraphSpec;
import uk.gov.gchq.gaffer.gaas.model.NewGraph;
import uk.gov.gchq.gaffer.graph.GraphConfig;

public final class CreateGraphRequestTestFactory {

    public static CreateGafferRequestBody makeCreateCRDRequestBody(final Graph graph) {
        final V1ObjectMeta metadata = new V1ObjectMeta().name("my-gaffer");

        return new CreateGafferRequestBody()
                .apiVersion("gchq.gov.uk/v1")
                .kind("Gaffer")
                .metaData(metadata)
                .spec(new GraphSpec()
                        .graph(new NewGraph()
                                .config(new GraphConfig.Builder()
                                        .graphId(graph.getGraphId())
                                        .description(graph.getDescription())
                                        .library(null)
                                        .build())));
    }

    private CreateGraphRequestTestFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
