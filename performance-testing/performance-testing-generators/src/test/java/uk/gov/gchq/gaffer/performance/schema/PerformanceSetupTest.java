/*
 * Copyright 2017 Crown Copyright
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
package uk.gov.gchq.gaffer.performance.schema;

import org.junit.Test;
import uk.gov.gchq.gaffer.commonutil.StreamUtil;
import uk.gov.gchq.gaffer.store.StoreProperties;
import uk.gov.gchq.gaffer.store.schema.Schema;
import java.io.InputStream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.emptyIterable;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class PerformanceSetupTest {

    @Test
    public void shouldContainValidSchema() {

        // Given
        final Schema schema = Schema.fromJson(StreamUtil.schemas(PerformanceSetupTest.class));

        // Then
        assertNotNull(schema);
        assertTrue(schema.validate());
    }

    @Test
    public void shouldContainValidPropertiesDefinition() {

        // Given
        final InputStream propertiesStream = StreamUtil.openStream(PerformanceSetupTest.class, "mockaccumulo.properties");
        final StoreProperties properties = StoreProperties.loadStoreProperties(propertiesStream);

        // Then
        assertNotNull(properties);
        assertThat(properties.getProperties()
                             .stringPropertyNames(), is(not(emptyIterable())));
    }
}
