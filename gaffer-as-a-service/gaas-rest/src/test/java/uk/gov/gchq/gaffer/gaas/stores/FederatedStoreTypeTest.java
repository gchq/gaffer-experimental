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

package uk.gov.gchq.gaffer.gaas.stores;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import uk.gov.gchq.gaffer.operation.impl.get.GetAllElements;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class FederatedStoreTypeTest {

    @Test
    void testGetType() {
        final FederatedStoreType type = new FederatedStoreType();

        assertEquals("federatedStore", type.getType());
    }

    @Test
    void testGetStoreSpecBuilder() throws IOException {
        final FederatedStoreType type = new FederatedStoreType();
        final AbstractStoreTypeBuilder storeSpecBuilder = type.getStoreSpecBuilder();

        final GafferSpec build = storeSpecBuilder
                .setGraphId("mygraph")
                .setDescription("Another description")
                .addOperationAuthoriser(GetAllElements.class, "Me")
                .build();

        final String expected = "{" +
                    "\"graph\":{" +
                        "\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"}," +
                        "\"config\":{" +
                            "\"description\":\"Another description\"," +
                            "\"graphId\":\"mygraph\"," +
                            "\"hooks\":[{" +
                                "\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\"," +
                                "\"auths\":{\"uk.gov.gchq.gaffer.operation.impl.get.GetAllElements\":[\"Me\"]}}]" +
                        "}" +
                    "}," +
                    "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}" +
                "}";
        assertEquals(expected, new ObjectMapper().writeValueAsString(build));
    }
}
