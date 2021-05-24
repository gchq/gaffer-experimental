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
import java.io.IOException;
import java.util.LinkedHashMap;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class ProxyStoreTypeTest {

    @Test
    void testGetType() {
        ProxyStoreType type = new ProxyStoreType();
        assertEquals("proxyStore", type.getType());
    }

    @Test
    void testGetStoreSpecBuilder() throws IOException {
        final ProxyStoreType type = new ProxyStoreType();
        final AbstractStoreTypeBuilder storeSpecBuilder = type.getStoreSpecBuilder();

        final GafferSpec build = storeSpecBuilder.setGraphId("mygraph").setDescription("Another description").setProperties(getStoreProperties()).build();

        final String expected = "{" +
                    "\"graph\":{" +
                        "\"storeProperties\":{\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.context-root\":\"/rest\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"}," +
                        "\"config\":{" +
                            "\"description\":\"Another description\"," +
                            "\"graphId\":\"mygraph\"," +
                            "\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{}}]" +
                        "}" +
                    "}," +
                    "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}" +
                "}";
        assertEquals(expected, new ObjectMapper().writeValueAsString(build));
    }

    private LinkedHashMap<String, Object> getStoreProperties() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("proxyHost", "http://my.graph.co.uk");
        elementsSchema.put("proxyContextRoot", "/rest");
        return elementsSchema;
    }
}
