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

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser;
import java.util.LinkedHashMap;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class MapStoreTypeTest {

    @Test
    void testGetType() {
        final MapStoreType type = new MapStoreType();

        assertEquals("mapStore", type.getType());
    }

    @Test
    void testGetStoreSpecBuilder() {
        final MapStoreType type = new MapStoreType();
        final AbstractStoreTypeBuilder storeSpecBuilder = type.getStoreSpecBuilder();

        final OperationAuthoriser operationAuthoriser = new OperationAuthoriser();
        operationAuthoriser.addAuths(AddGraph.class, "UNKNOWN", "WriteUser");
        final GafferSpec build = storeSpecBuilder.setGraphId("mygraph").setDescription("Another description").addHook(operationAuthoriser).setSchema(getSchema()).build();

        final String expected = "{" +
                "\"graph\":{" +
                    "\"schema\":{\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"}," +
                    "\"storeProperties\":{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"}," +
                    "\"config\":{" +
                        "\"description\":\"Another description\"," +
                        "\"graphId\":\"mygraph\"," +
                        "\"hooks\":[" +
                            "{\"allAuths\":[\"WriteUser\",\"SuperUser\"],\"auths\":{\"class uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"WriteUser\",\"SuperUser\"]}}" +
                        "]" +
                    "}" +
                "}," +
                "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}" +
                "}";
        assertEquals(expected, new Gson().toJson(build));
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }
}
