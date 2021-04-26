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

package uk.gov.gchq.gaffer.gaas.factories;

import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class ProxyStoreTypeTest {
    @Test
    void testGetType() {
        ProxyStoreType type = new ProxyStoreType();
        assertEquals("proxyStore", type.getType());
    }

    @Test
    void testGetStoreSpecBuilder() {
        ProxyStoreType type = new ProxyStoreType();
        GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("mygraph", "Another description", "proxyStore", "http://my.graph.co.uk", "/rest");

        AbstractStoreTypeBuilder storeSpecBuilder = type.getStoreSpecBuilder(gaaSCreateRequestBody);
        String expected = "{graph={storeProperties={gaffer.host=http://my.graph.co.uk, gaffer.context-root=/rest, gaffer.store.class=uk.gov.gchq.gaffer.proxystore.ProxyStore}, config={description=Another description, graphId=mygraph}}, ingress={host=mygraph-kai-dev.apps.my.kubernetes.cluster, pathPrefix={ui=/ui, api=/rest}}}";
        GafferSpec build = storeSpecBuilder.setGraphId("mygraph").setDescription("Another description").build();
        assertEquals(expected, build.toString());
    }
}
