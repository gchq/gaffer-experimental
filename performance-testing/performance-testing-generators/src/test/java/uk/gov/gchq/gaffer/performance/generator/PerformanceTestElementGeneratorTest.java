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
package uk.gov.gchq.gaffer.performance.generator;

import org.junit.Test;
import uk.gov.gchq.gaffer.commonutil.StreamUtil;
import uk.gov.gchq.gaffer.data.element.Element;
import uk.gov.gchq.gaffer.graph.Graph;
import uk.gov.gchq.gaffer.operation.OperationException;
import uk.gov.gchq.gaffer.operation.impl.add.AddElements;
import uk.gov.gchq.gaffer.performance.schema.PerformanceSetupTest;
import uk.gov.gchq.gaffer.store.StoreProperties;
import uk.gov.gchq.gaffer.store.schema.Schema;
import uk.gov.gchq.gaffer.user.User;
import java.io.InputStream;

import static org.junit.Assert.assertNotNull;

public class PerformanceTestElementGeneratorTest {

    private final Schema schema = Schema.fromJson(StreamUtil.schemas(getClass()));
    private final InputStream propertiesStream = StreamUtil.openStream(PerformanceSetupTest.class, "mockaccumulo.properties");
    private final StoreProperties properties = StoreProperties.loadStoreProperties(propertiesStream);

    @Test
    public void shouldCreateValidElement() throws OperationException {

        // Given
        final PerformanceTestElementGenerator generator = new PerformanceTestElementGenerator();

        // When
        final String line = "1,2";
        final Iterable<Element> elements = generator.getElements(line);

        final Graph graph = new Graph.Builder().addSchema(schema)
                                               .storeProperties(properties)
                                               .build();

        final AddElements addElements = new AddElements.Builder().input(elements)
                                                                 .build();

        graph.execute(addElements, new User());

        // Then
        assertNotNull(elements);
    }
}
