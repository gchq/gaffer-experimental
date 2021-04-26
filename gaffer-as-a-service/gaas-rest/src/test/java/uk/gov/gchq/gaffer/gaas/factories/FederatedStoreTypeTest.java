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
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class FederatedStoreTypeTest {
    @Test
    void testGetType() {
        FederatedStoreType type = new FederatedStoreType();
        assertEquals("federatedStore", type.getType());
    }

    @Test
    void testGetStoreSpecBuilder() {
        FederatedStoreType type = new FederatedStoreType();
        GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("mygraph", "Another description", "federatedStore");

        AbstractStoreTypeBuilder storeSpecBuilder = type.getStoreSpecBuilder(gaaSCreateRequestBody);
        String expected = "{graph={storeProperties={gaffer.serialiser.json.modules=uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules, gaffer.store.properties.class=uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties, gaffer.store.class=uk.gov.gchq.gaffer.federatedstore.FederatedStore}, config={description=Another description, graphId=mygraph}}, ingress={host=mygraph-kai-dev.apps.my.kubernetes.cluster, pathPrefix={ui=/ui, api=/rest}}}";
        GafferSpec build = storeSpecBuilder.setGraphId("mygraph").setDescription("Another description").build();
        assertEquals(expected, build.toString());
    }

}
