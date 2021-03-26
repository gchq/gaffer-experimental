package uk.gov.gchq.gaffer.gaas.converters;/*
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

import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.model.StoreType;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class GafferSpecBuilderTest {

    @Test
    public void whenAccumuloIsEnabledAndStorePropertiesIsSet_throwIAX() {
        assertThrows(IllegalArgumentException.class, () -> new GafferSpecBuilder()
                .graphId("id")
                .description("a description")
                .storeProperties(StoreType.MAPSTORE)
                .enableAccumulo()
                .build());
    }
}